import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // 개발 모드에서는 핫 리로딩 시 연결이 계속 생기는 것을 방지하기 위해 전역 변수 사용
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // 프로덕션 모드에서는 일반적인 연결
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;