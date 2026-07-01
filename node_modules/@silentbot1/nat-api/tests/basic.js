import NatAPI from '../index.js'

const port = 6690

const enablePMP = [true, false]
const enableUPNP = [true, false]
const protocols = ['TCP', 'UDP']

const test = async (protocol, opts) => {
  const client = new NatAPI({ enablePMP: opts.enablePMP, enableUPNP: opts.enableUPNP, upnpPermanentFallback: false })

  const options = { publicPort: port, privatePort: port, protocol }
  let response = await client.map(options)
  console.log(`   Port ${port} mapped to ${port} ${protocol} Success: ${response}`)
  response = await client.unmap(options)
  console.log(`   Port ${port} unmapped from ${port} ${protocol} Success: ${response}`)

  await client.destroy()
}

const main = async () => {
  for (const useUPNP of enableUPNP) {
    for (const usePMP of enablePMP) {
      console.log(`enablePMP: ${usePMP} enableUPNP: ${useUPNP}`)
      for (const protocol of protocols) {
        await test(protocol, { enablePMP: usePMP, enableUPNP: useUPNP })
      }
    }
  }
}

main().catch(console.error)
