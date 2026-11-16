'use strict'

const os = require('os')
const bin = require('./bin')
const history = require('./history')

function parseDate (datestr) {
  const year = datestr.substring(0, 4)
  const month = datestr.substring(4, 6)
  const day = datestr.substring(6, 8)
  const hour = datestr.substring(8, 10)
  const minutes = datestr.substring(10, 12)
  const seconds = datestr.substring(12, 14)
  const useconds = datestr.substring(15, 21)
  const sign = datestr.substring(21, 22)
  const tmz = parseInt(datestr.substring(22, 25), 10)
  const tmzh = Math.floor(tmz / 60)
  const tmzm = tmz % 60

  return new Date(
    year + '-' + month + '-' + day + 'T' + hour +
    ':' + minutes + ':' + seconds +
    '.' + useconds +
    sign + (tmzh > 9 ? tmzh : '0' + tmzh) + '' + (tmzm > 9 ? tmzm : '0' + tmzm)
  )
}

function gwmi (pids, options, done) {
  let whereClause = 'ProcessId=' + pids[0]
  for (let i = 1; i < pids.length; i++) {
    whereClause += ' or ' + 'ProcessId=' + pids[i]
  }

  const property = 'CreationDate,KernelModeTime,ParentProcessId,ProcessId,UserModeTime,WorkingSetSize'
  const command = 'gwmi win32_process -Filter \'' + whereClause + '\' | select ' + property + ' | format-table'

  // Spawn powershell directly instead of through the `shell` option so that
  // `-NoProfile` and `-NonInteractive` can be passed: without them every poll
  // loads the user profile, which runs arbitrary startup code, slows each call
  // down and makes any profile writing to stderr fail the poll (see bin.js).
  bin('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command], { windowsHide: true }, function (err, stdout, code) {
    if (err) {
      if (err.message.indexOf('No Instance(s) Available.') !== -1) {
        const error = new Error('No matching pid found')
        error.code = 'ENOENT'
        return done(error)
      }
      return done(err)
    }
    if (code !== 0) {
      return done(new Error('pidusage gwmi command exited with code ' + code))
    }
    const date = Date.now()

    // Note: On Windows the returned value includes fractions of a second.
    // Use Math.floor() to get whole seconds.
    // Fallback on current date when uptime is not allowed (see https://github.com/soyuka/pidusage/pull/130)
    const uptime = Math.floor(os.uptime() || (date / 1000))

    // Example of stdout on Windows 10
    // CreationDate: is in the format yyyymmddHHMMSS.mmmmmmsUUU
    // KernelModeTime: is in units of 100 ns
    // UserModeTime: is in units of 100 ns
    // WorkingSetSize: is in bytes
    //
    // Refs: https://superuser.com/a/937401/470946
    // Refs: https://msdn.microsoft.com/en-us/library/aa394372(v=vs.85).aspx
    // NB: The columns are returned in lexicographical order
    //
    // Stdout Format
    //
    // Active code page: 936
    //
    // CreationDate              KernelModeTime ParentProcessId ProcessId UserModeTime WorkingSetSize
    // ------------              -------------- --------------- --------- ------------ --------------
    // 20220220185531.619182+480      981406250           18940      2804    572656250       61841408

    stdout = stdout.split(os.EOL).slice(1)
    const index = stdout.findIndex(v => !!v)
    stdout = stdout.slice(index + 2)

    if (!stdout.length) {
      const error = new Error('No matching pid found')
      error.code = 'ENOENT'
      return done(error)
    }

    let again = false
    const statistics = {}
    for (let i = 0; i < stdout.length; i++) {
      const line = stdout[i].trim().split(/\s+/)

      if (!line || line.length === 1) {
        continue
      }

      const creation = parseDate(line[0])
      const ppid = parseInt(line[2], 10)
      const pid = parseInt(line[3], 10)
      const kerneltime = Math.round(parseInt(line[1], 10) / 10000)
      const usertime = Math.round(parseInt(line[4], 10) / 10000)
      const memory = parseInt(line[5], 10)

      let hst = history.get(pid, options.maxage)
      if (hst === undefined) {
        again = true
        hst = { ctime: kerneltime + usertime, uptime }
      }

      // process usage since last call
      const total = (kerneltime + usertime - hst.ctime) / 1000
      // time elapsed between calls in seconds
      const seconds = uptime - hst.uptime
      const cpu = seconds > 0 ? (total / seconds) * 100 : 0

      history.set(pid, { ctime: usertime + kerneltime, uptime }, options.maxage)

      statistics[pid] = {
        cpu,
        memory,
        ppid,
        pid,
        ctime: usertime + kerneltime,
        elapsed: date - creation.getTime(),
        timestamp: date
      }
    }

    if (again) {
      return gwmi(pids, options, function (err, stats) {
        if (err) return done(err)
        done(null, Object.assign(statistics, stats))
      })
    }
    done(null, statistics)
  })
}

module.exports = gwmi
