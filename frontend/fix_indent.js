const fs = require('fs');
const path = './src/app/admin/projects/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 잘못된 들여쓰기를 수정 (form 내부의 모든 요소를 2칸씩 들여쓰기 감소)
content = content.replace(/^            (<div>|<label|<input|<select|<option|<textarea|<button)/gm, '          $1');
content = content.replace(/^              (<h2|<button)/gm, '            $1');
content = content.replace(/^                (<X|className=|onClick=|type=|value=|onChange=|rows=|min=|max=)/gm, '              $1');
content = content.replace(/^                  (>|<option|취소|생성)/gm, '                $1');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed indentation');
