import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'src/controllers');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  content = content.replace(/} catch \(e\) { res\.status\(500\)\.json\({ (message|error): "([A-Za-z \-\.]+)" }\); }/g, '} catch (e) { console.error("Error:", e.message); res.status(500).json({ $1: \"$2\" }); }');
  content = content.replace(/} catch \(e\) {\s+res\.status\(500\)\.json\({ (message|error): "([A-Za-z \-\.]+)" }\);\s+}/g, '} catch (e) { console.error("Error:", e.message); res.status(500).json({ $1: \"$2\" }); }');
  fs.writeFileSync(path.join(dir, file), content, 'utf8');
}
console.log('Fixed controllers');