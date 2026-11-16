/** Change notation only. The target is explicit; no network connections are made. */
export function convertPath(value, target = 'smb', customProtocol = '') {
  let input = value.trim();
  if ((input.startsWith('"') && input.endsWith('"')) || (input.startsWith("'") && input.endsWith("'"))) input = input.slice(1, -1).trim();
  if (!input) return {output:'',direction:'',note:''};
  if (/[\r\n]/.test(input)) throw new Error('한 번에 하나의 경로를 입력해 주세요.');
  if (!['windows','smb','afp','none','custom'].includes(target)) throw new Error('지원하지 않는 연결 형식입니다.');
  let protocol = target;
  if (target === 'custom') {
    protocol = customProtocol.trim().replace(/:\/\/$/, '').toLowerCase();
    if (!/^[a-z][a-z\d+.-]*$/.test(protocol)) throw new Error('프로토콜을 입력해 주세요. 예: nfs 또는 nfs://');
  }
  const scheme = input.match(/^([a-z][a-z\d+.-]*):\/\//i);
  if (scheme && /^(https?|file)$/i.test(scheme[1])) throw new Error('웹 주소 대신 공유 폴더 경로를 입력해 주세요.');
  const network = Boolean(scheme) || /^[\\/]{2}/.test(input);
  const source = scheme ? scheme[1].toUpperCase() : input.includes('\\') ? 'Windows' : 'Path';
  const label = target === 'windows' ? 'Windows' : target === 'none' ? '//' : protocol.toUpperCase();
  let path = (scheme ? input.slice(scheme[0].length) : input).replace(/\\/g,'/');
  if (network) path = path.replace(/^\/+/, '');
  if (network && !path) throw new Error('서버 이름을 입력해 주세요.');
  const output = target === 'windows'
    ? (network ? '\\\\' : '') + path.replace(/\//g,'\\')
    : (network ? (target === 'none' ? '//' : protocol+'://') : '') + path;
  const note = network ? '공유 폴더의 경로 표기만 바꿉니다. 연결하려면 해당 네트워크 접근 권한이 필요합니다.' : '로컬 경로는 구분자만 바꿉니다. 드라이브와 /Volumes의 실제 위치는 자동으로 연결되지 않습니다.';
  return {output,direction:source+' → '+label,note};
}
