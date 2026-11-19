import encoder from '@jsquash/avif/codec/enc/avif_enc.js';
import decoder from '@jsquash/avif/codec/dec/avif_dec.js';
import {defaultOptions} from '@jsquash/avif/meta.js';
import {initEmscriptenModule} from '@jsquash/avif/utils.js';
export async function encodeAVIF(data,quality,wasm){
 if(!data.width||!data.height||data.width*data.height>40000000)throw Error('IMAGE_SIZE');
 const module=await initEmscriptenModule(encoder,wasm);
 const output=module.encode(new Uint8Array(data.data.buffer,data.data.byteOffset,data.data.byteLength),data.width,data.height,{...defaultOptions,quality,qualityAlpha:100,speed:8});
 if(!output)throw Error('ENCODE_FAILED');return output.buffer;
}
export async function decodeAVIF(buffer,wasm){
 const module=await initEmscriptenModule(decoder,wasm);
 const data=module.decode(buffer,8);if(!data)throw Error('DECODE_FAILED');
 if(data.width*data.height>40000000)throw Error('IMAGE_SIZE');return data;
}
