export function normalizePastedTheory(text: string): string {
  if (!text) return text;
  
  let result = text;
  
  result = result.replace(/^\uFEFF/, '');
  
  result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  result = result.replace(/^\s*\d+[.:)]\s*/gm, '');
  result = result.replace(/^\s*[•\-\*]\s*/gm, '');
  result = result.replace(/^\s*[a-zA-Z][.:)]\s*/gm, '');
  
  result = result.replace(/\t/g, ' ');
  result = result.replace(/ +/g, ' ');
  
  result = result.replace(/^\s+$/gm, '');
  
  const lines = result.split('\n');
  const joinedLines: string[] = [];
  let buffer = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      if (buffer) {
        joinedLines.push(buffer.trim());
        buffer = '';
      }
      continue;
    }
    
    if (buffer) {
      const combined = buffer + ' ' + line;
      buffer = combined;
    } else {
      buffer = line;
    }
    
    const openParens = (buffer.match(/\(/g) || []).length;
    const closeParens = (buffer.match(/\)/g) || []).length;
    const openBrackets = (buffer.match(/\[/g) || []).length;
    const closeBrackets = (buffer.match(/\]/g) || []).length;
    const openBraces = (buffer.match(/\{/g) || []).length;
    const closeBraces = (buffer.match(/\}/g) || []).length;
    
    const balanced = 
      openParens === closeParens && 
      openBrackets === closeBrackets && 
      openBraces === closeBraces;
    
    const endsWithQuantifier = /[∀∃]\s*$/.test(buffer);
    const endsWithConnective = /[∧∨→↔¬∈⊆⊂]\s*$/.test(buffer);
    const endsWithOperator = /[=<>+\-*/]\s*$/.test(buffer);
    const startsWithConnective = /^[∧∨→↔]/.test(line);
    
    if (balanced && !endsWithQuantifier && !endsWithConnective && !endsWithOperator && !startsWithConnective) {
      joinedLines.push(buffer.trim());
      buffer = '';
    }
  }
  
  if (buffer) {
    joinedLines.push(buffer.trim());
  }
  
  result = joinedLines.filter(line => line.length > 0).join('\n');
  
  result = result.replace(/ +/g, ' ');
  
  return result;
}

export function handlePaste(
  e: React.ClipboardEvent<HTMLTextAreaElement>,
  setValue: (value: string) => void
) {
  e.preventDefault();
  const pastedText = e.clipboardData.getData('text');
  const normalized = normalizePastedTheory(pastedText);
  
  const target = e.target as HTMLTextAreaElement;
  const start = target.selectionStart;
  const end = target.selectionEnd;
  const currentValue = target.value;
  
  const newValue = currentValue.substring(0, start) + normalized + currentValue.substring(end);
  setValue(newValue);
}
