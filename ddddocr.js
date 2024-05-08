import * as ort from 'onnxruntime-web/wasm';

let session;
let charset;

async function actualInit() {
  session = await ort.InferenceSession.create('./common.onnx', { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
  charset = await fetch('./charset.json').then(x => x.json());
}
export const initPromise = actualInit();

/**
 * @param {string | Blob} src 
 */
export async function recognize(src) {
  await initPromise;
  const image = await loadImageData(src)
  const tensor = await coverImageToTensor(image);

  const outTensor = Object.values(await session.run({ input1: tensor }))[0];
  const rowCount = outTensor.dims[0];
  const charsetSize = outTensor.dims[2];

  let answer = ''
  for (let i = 0; i < rowCount; i++) {
    const row = outTensor.data.slice(i * charsetSize, (i + 1) * charsetSize);
    const maxIndex = row.reduce((p, c, i) => (c > row[p]) ? i : p, 0);
    const char = charset[maxIndex];
    // console.log(char, row[maxIndex]);

    answer += char;
  }

  return { answer };
}

/**
 * @param {string | Blob} src 
 */
async function loadImageData(src) {
  const image = src instanceof Blob ? src : await fetch(src).then(x => x.blob());
  const imageBitmap = await createImageBitmap(image);

  const canvas = document.createElement('canvas');
  const height = 64
  const width = Math.floor(imageBitmap.width * (64 / imageBitmap.height))
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.filter = 'grayscale(1)';
  ctx.drawImage(imageBitmap, 0, 0, width, height);

  return ctx.getImageData(0, 0, width, height);
}

/**
 * @param {ImageData} imageData 
 */
async function coverImageToTensor(imageData) {
  const dim = imageData.width * imageData.height; // 内置模型是灰色的
  const tensorData = new Float32Array(dim);
  for (let i = 0; i < dim; i++) {
    tensorData[i] = imageData.data[i * 4] / 127.5 - 1;
  }
  return new ort.Tensor("float32", tensorData, [1, 1, imageData.height, imageData.width]);
}
