const databaseName = 'deal-collega-local-files'
const storeName = 'files'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('De lokale bestandsopslag kon niet worden geopend.'))
  })
}

export async function saveLocalFile(id: string, file: File): Promise<void> {
  const database = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).put(file, id)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(new Error('Het bestand kon niet lokaal worden opgeslagen.'))
    transaction.onabort = () => reject(new Error('Het opslaan van het bestand is afgebroken.'))
  }).finally(() => database.close())
}

export async function getLocalFile(id: string): Promise<Blob | undefined> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly')
    const request = transaction.objectStore(storeName).get(id)
    request.onsuccess = () => {
      const result: unknown = request.result
      resolve(result instanceof Blob ? result : undefined)
    }
    request.onerror = () => reject(new Error('Het lokaal opgeslagen bestand kon niet worden gelezen.'))
    transaction.oncomplete = () => database.close()
    transaction.onerror = () => database.close()
  })
}

export async function deleteLocalFile(id: string): Promise<void> {
  const database = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).delete(id)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(new Error('Het tijdelijke lokale bestand kon niet worden opgeruimd.'))
  }).finally(() => database.close())
}
