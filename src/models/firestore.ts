import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";

export const converter = <T extends DocumentData>() => {
    return {
        toFirestore(data: T): DocumentData {
            return data;
        },
        fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T {
          const data = snapshot.data(options)!;
          return {...data} as T;
        }
    }
}