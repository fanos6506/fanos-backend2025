const fs = require('fs');
const path = require('path');

// 📝 المجلدات التي تريد البحث فيها (عدلها حسب مشروعك)
const foldersToScan = [
    path.join(__dirname, 'server', 'api', 'v1', 'controllers'),
    path.join(__dirname, 'server', 'api', 'v1', 'services'),
    path.join(__dirname, 'server', 'helpers'),
    path.join(__dirname, 'server', 'models'),
];

// جميع الأنماط المحتملة (تدعم populate و select و sort و limit)
const queryPatterns = [
    { regex: /(\w+)\.(findOne|findById|find|findByIdAndUpdate|findOneAndUpdate)\((.*?)\)((?:\.\w+\([^\)]*\))*)\.exec\((.*?)\)/gs },
];

let modifiedFiles = [];
let skippedFiles = [];

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    queryPatterns.forEach(({ regex }) => {
        content = content.replace(regex, (match, modelName, method, args, chainMethods, callback) => {

            const callbackMatch =
                callback.match(/\(\s*err\s*,\s*(\w+)\s*\)\s*=>\s*\{([\s\S]*?)\}$/) ||
                callback.match(/function\s*\(\s*err\s*,\s*(\w+)\s*\)\s*\{([\s\S]*?)\}$/);

            if (!callbackMatch) return match; // تخطى إذا لم يتطابق

            const resultVar = callbackMatch[1];
            const body = callbackMatch[2].trim();

            const cleanChain = chainMethods.replace(/\s+/g, ' ');

            return `\n// ✅ تم تحويل هذا الاستعلام إلى await (مع سلاسل: ${cleanChain.trim()})
let ${resultVar};
try {
    ${resultVar} = await ${modelName}.${method}(${args.trim()})${cleanChain};
    ${body}
} catch (err) {
    console.error(err);
}`;
        });
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        modifiedFiles.push(filePath);
        console.log(`✅ تم تعديل الملف: ${filePath}`);
    } else {
        skippedFiles.push(filePath);
        console.log(`➖ لا يحتاج تعديل: ${filePath}`);
    }
}

function processFolder(folderPath) {
    if (!fs.existsSync(folderPath)) {
        console.log(`❌ المجلد غير موجود: ${folderPath}`);
        return;
    }

    const files = fs.readdirSync(folderPath);

    files.forEach(file => {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            processFolder(filePath); // البحث داخل المجلدات الفرعية
        } else if (file.endsWith('.js')) {
            updateFile(filePath);
        }
    });
}

// بدء التنفيذ
console.log('🔎 جاري تحويل الاستعلامات في المجلدات التالية:\n');
foldersToScan.forEach(folder => console.log(folder));
console.log('\n-----------------------------');

foldersToScan.forEach(processFolder);

// التقرير النهائي
console.log('\n===== التقرير النهائي =====');
console.log(`📄 الملفات المعدلة: ${modifiedFiles.length}`);
modifiedFiles.forEach(f => console.log(`✅ ${f}`));
console.log(`\n📄 الملفات التي لم تحتاج تعديل: ${skippedFiles.length}`);
skippedFiles.forEach(f => console.log(`➖ ${f}`));
console.log('============================');
