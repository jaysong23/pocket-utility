/** Convert path notation only; no filesystem access or mount mapping. */
export function convertPath(value, protocol = 'smb', customProtocol = '') {
  let input = value.trim();
  if ((input.startsWith('"') && input.endsWith('"')) || (input.startsWith("'") && input.endsWith("'"))) input = input.slice(1, -1);
  if (!input) return { output: '', direction: '', note: '' };
  if (/[\r\n]/.test(input)) throw new Error('한 번에 하나의 경로를 입력해 주세요.');
  if (protocol === 'custom') {
    protocol = customProtocol.trim().replace(/:\/\/$/, '').toLowerCase();
    if (!/^[a-z][a-z\d+.-]*$/.test(protocol)) throw new Error('프로토콜을 입력해 주세요. 예: nfs 또는 nfs://');
  }
  if (!/^[a-z][a-z\d+.-]*$/i.test(protocol)) throw new Error('지원하지 않는 연결 형식입니다.');
  const scheme = input.match(/^([a-z][a-z\d+.-]*):\/\//i);
  if (scheme && !['smb','afp',protocol].includes(scheme[1].toLowerCase())) throw new Error('이 주소의 프로토콜을 사용하려면 직접 입력에서 같은 프로토콜을 지정해 주세요.');
  const windows = !scheme && input.includes('\\');
  const network = windows ? input.startsWith('\\\\') : Boolean(scheme) || input.startsWith('//');
  const note = network ? '공유 폴더의 경로 표기만 바꿉니다. 연결하려면 해당 네트워크 접근 권한이 필요합니다.' : '로컬 경로는 구분자만 바꿉니다. 드라이브와 /Volumes의 실제 위치는 자동으로 연결되지 않습니다.';
  if (windows) {
    let output = input.replace(/\\/g, '/');
    if (network && protocol !== 'none') output = `${protocol}://${output.replace(/^\/+/, '')}`;
    return { output, direction: 'Windows → Mac', note };
  }
  return { output: input.replace(/^[a-z][a-z\d+.-]*:(?=\/\/)/i, '').replace(/\//g, '\\'), direction: 'Mac → Windows', note };
}
