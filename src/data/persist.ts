
const PREFIX = 'data-persist-'

export default async function persist(key: string[], fetcher: () => Promise<any>) {
    const pk = PREFIX + key.join('_')

    const data = localStorage.getItem(pk)
    if (data) {
        return JSON.parse(data)
    }

    const result = await fetcher()
    localStorage.setItem(pk, JSON.stringify(result))
    return result
}