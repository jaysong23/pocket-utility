/** Convert path notation only; no filesystem access or mount mapping. */
export function convertPath(value, protocol = 'smb') {
  let input = value.trim();
  if ((input.startsWith('"') && input.endsWith('"')) || (input.startsWith("'") && input.endsWith("'"))) input = input.slice(1, -1);
  if (!input) return { output: '', direction: '', note: '' };
  if (/[\r\n]/.test(input)) throw new Error('한 번에 하나의 경로를 입력해 주세요.');
  if (!['smb', 'afp', 'none'].includes(protocol)) throw new Error('지원하지 않는 연결 형식입니다.');
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(input) && !/^(smb|afp):\/\//i.test(input)) throw new Error('웹 주소 대신 윈도우 경로나 smb://, afp:// 공유 경로를 입력해 주세요.');
  const windows = input.includes('\\');
  const network = windows ? input.startsWith('\\\\') : /^(smb|afp):\/\//i.test(input) || input.startsWith('//');
  const note = network ? '공유 폴더의 경로 표기만 바꿉니다. 연결하려면 해당 네트워크 접근 권한이 필요합니다.' : '로컬 경로는 구분자만 바꿉니다. 드라이브와 /Volumes의 실제 위치는 자동으로 연결되지 않습니다.';
  if (windows) {
    let output = input.replace(/\\/g, '/');
    if (network && protocol !== 'none') output = `${protocol}://${output.replace(/^\/+/, '')}`;
    return { output, direction: 'Windows → Mac', note };
  }
  return { output: input.replace(/^(smb|afp):/i, '').replace(/\//g, '\\'), direction: 'Mac → Windows', note };
}
