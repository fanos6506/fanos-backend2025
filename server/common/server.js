import express from "express";
import mongoose from "mongoose";
import http from "http";
import path, { dirname } from "path";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { Server as SocketIOServer } from "socket.io";
import WebSocketPkg from "websocket"; // ✅ Import كامل للمكتبة
import { fileURLToPath } from "url";

import apiErrorHandler from "../helper/apiErrorHandler.js";
import userController from "../api/v1/controllers/user/controller.js";
import chatController from "../api/v1/controllers/socket/controller.js";
import userModel from "../models/user.js";

// Helpers
const WebSocketServer = WebSocketPkg.server;
const WebSocketClient = WebSocketPkg.client;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  path: '/socket.io'
});
const root = path.resolve(__dirname, "../..");

// Setup classic websocket server
const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
  maxReceivedFrameSize: 64 * 1024 * 1024,
  maxReceivedMessageSize: 64 * 1024 * 1024,
  fragmentOutgoingMessages: false,
  keepalive: false,
  disableNagleAlgorithm: false
});

const client = new WebSocketClient();

// Store online users
let onlineUsers = [];

class ExpressServer {
  constructor() {
    // Parse JSON bodies
    app.use(express.json({ limit: '50mb' }));
    
    // Parse URL-encoded bodies (form data)
    app.use(express.urlencoded({ 
      extended: true, 
      limit: '50mb',
      parameterLimit: 50000 
    }));
    
    // Configure CORS
    app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Add request logging
    app.use(morgan('dev'));

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      console.log('⚡ New Socket.IO client connected:', socket.id);

      // Handle user coming online
      socket.on('onlineUser', async (data) => {
        try {
          if (!data.userId) {
            socket.emit('error', { message: 'User ID is required' });
            return;
          }

          const user = await userModel.findById(data.userId);
          if (!user) {
            socket.emit('error', { message: 'User not found' });
            return;
          }

          // Remove any existing socket connections for this user
          onlineUsers = onlineUsers.filter(u => u.userId !== user._id.toString());

          // Add new socket connection
          onlineUsers.push({
            userId: user._id.toString(),
            socketId: socket.id,
            status: 'ONLINE',
            userName: user.userName || ''
          });

          // Broadcast user online status
          io.emit('userStatusUpdate', {
            userId: user._id.toString(),
            status: 'ONLINE'
          });

          console.log(`User ${user._id} is now online`);
        } catch (err) {
          console.error('Error in onlineUser event:', err);
          socket.emit('error', { message: 'Internal server error' });
        }
      });

      // Handle chat messages
      socket.on('oneToOneChat', async (data) => {
        try {
          if (!data.senderId || !data.receiverId || !data.message) {
            socket.emit('error', { message: 'Invalid message data' });
            return;
          }

          const chatResult = await chatController.oneToOneChat(data);
          
          // Send to both sender and receiver
          const recipients = onlineUsers.filter(u => 
            [data.senderId, data.receiverId].includes(u.userId)
          );

          recipients.forEach(user => {
            io.to(user.socketId).emit('oneToOneChat', {
              ...chatResult,
              chatHistory: user.userId === data.receiverId ? 
                chatResult.chatHistory : 
                chatResult.senderHistory
            });
          });

        } catch (err) {
          console.error('Error in oneToOneChat event:', err);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const user = onlineUsers.find(u => u.socketId === socket.id);
        if (user) {
          // Remove user from online users
          onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);
          
          // Broadcast user offline status
          io.emit('userStatusUpdate', {
            userId: user.userId,
            status: 'OFFLINE'
          });

          console.log(`User ${user.userId} disconnected`);
        }
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  }

  router(routes) {
    routes(app);
    return this;
  }

  configureSwagger(swaggerDefinition) {
    const options = {
      swaggerDefinition: {
        ...swaggerDefinition,
        openapi: '3.0.0',
        servers: swaggerDefinition.servers || [
          {
            url: `http://${swaggerDefinition.host || 'localhost:3032'}`,
            description: 'Development server'
          }
        ],
        components: {
          securitySchemes: {
            tokenauth: {
              type: 'apiKey',
              in: 'header',
              name: 'Authorization'
            }
          }
        },
        security: [{
          tokenauth: []
        }]
      },
      apis: [
        path.resolve(root, "server/api/v1/controllers/**/*.js"),
        path.resolve(root, "api.yaml"),
        path.resolve(root, "server/api/v1/routes.js")
      ]
    };

    const swaggerSpec = swaggerJSDoc(options);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: "Fanous API Documentation"
    }));
    console.log('✅ Swagger documentation is available at /api-docs');
    return this;
  }

  handleError() {
    app.use(apiErrorHandler);
    return this;
  }

  configureDb(dbUrl) {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4  // Use IPv4, skip trying IPv6
    };

    return mongoose
      .connect(dbUrl, options)
      .then(() => {
        console.log("✅ MongoDB connected successfully");
        mongoose.connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
        });
        mongoose.connection.on('disconnected', () => {
          console.warn('MongoDB disconnected. Attempting to reconnect...');
        });
        mongoose.connection.on('reconnected', () => {
          console.log('MongoDB reconnected successfully');
        });
        return this;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        if (err.name === 'MongoServerError' && err.code === 13) {
          console.error("Authentication failed. Please check database credentials.");
        }
        throw err;
      });
  }

  listen(port) {
    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
    this.setupSocketEvents();
    this.setupWebSocketEvents();
    return app;
  }

  setupSocketEvents() {
    io.on("connection", (socket) => {
      console.log("⚡ New Socket.io connection:", socket.id);

      socket.on("oneToOneChat", async (data) => {
        try {
          const chatSend = await chatController.oneToOneChat(data);
          const recipients = onlineUsers.filter(u => [data.senderId, data.receiverId].includes(u.userId));

          recipients.forEach((user) => {
            io.to(user.socketId).emit("oneToOneChat", {
              response_code: chatSend.response_code,
              response_message: chatSend.response_message,
              result: chatSend.result,
              chatHistory: user.userId === data.receiverId ? chatSend.chatHistory : chatSend.senderHistory,
            });
          });

          if (recipients.length === 0) {
            io.to(socket.id).emit("oneToOneChat", chatSend);
          }
        } catch (err) {
          console.error("Error in oneToOneChat:", err);
        }
      });

      socket.on("onlineUser", async (data) => {
        try {
          const user = await userModel.findById(data.userId);
          if (user) {
            const existing = onlineUsers.find(u => u.userId === user._id.toString());
            if (!existing) {
              onlineUsers.push({
                userId: user._id.toString(),
                socketId: socket.id,
                status: "ONLINE",
                userName: user.userName || "",
              });
            }
          }
        } catch (err) {
          console.error("Error setting online user:", err);
        }
      });

      socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  setupWebSocketEvents() {
    wsServer.on("request", (request) => {
      const connection = request.accept(null, request.origin);
      console.log("✅ WebSocket client connected");

      connection.on("message", async (message) => {
        try {
          const data = JSON.parse(message.utf8Data);

          if (data.requestType === "NotificationList") {
            const notifications = await userController.getNotificationList(data.token);
            connection.sendUTF(JSON.stringify(notifications));
          }

          if (data.user_token) {
            const msgCount = await chatController.messageReceiveUserCount(data.user_token);
            connection.sendUTF(JSON.stringify(msgCount.responseResult));
          }

          if (data.type === "ChatHistory") {
            const chatHistory = await chatController.chatHistoryWebSocket(data);
            connection.sendUTF(JSON.stringify(chatHistory));
          }
        } catch (err) {
          console.error("WebSocket message error:", err);
        }
      });

      connection.on("close", () => {
        console.log("❌ WebSocket client disconnected");
      });
    });

    client.on("connect", (connection) => {
      console.log("🔗 Connected to external WebSocket server");
      connection.on("error", (error) => console.error("Client error:", error));
      connection.on("close", () => console.log("Client WebSocket connection closed"));
    });

    client.connect('ws://localhost:3032');
  }
}

function originIsAllowed(origin) {
  return true;
}

export default ExpressServer;
