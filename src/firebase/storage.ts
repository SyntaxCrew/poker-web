import { getStorage, uploadBytes, ref, getDownloadURL } from 'firebase/storage'
import app from './firebase'
import { randomString } from '../utils/generator';

const storage = getStorage(app);
const bucket = (url: string) => ref(storage, url);

export async function getFileURL(url: string) {
    return await getDownloadURL(bucket(url));
}

export async function uploadFile(folder: string, file: File) {
    let fileName = randomString(30);
    if (file.name.lastIndexOf('.') !== -1) {
        fileName += file.name.substring(file.name.lastIndexOf('.'));
    }
    const url = `${folder}/${fileName}`;
    await uploadBytes(bucket(url), file);
    return url;
}
