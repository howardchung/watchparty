Node-SSH - SSH2 with Promises
=========

Node-SSH is an extremely lightweight Promise wrapper for [ssh2][ssh2].

#### Example

```js
const fs = require('fs')
const path = require('path')
const {NodeSSH} = require('node-ssh')

const ssh = new NodeSSH()

ssh.connect({
  host: 'localhost',
  username: 'steel',
  privateKeyPath: '/home/steel/.ssh/id_rsa'
})

// or with inline privateKey

ssh.connect({
  host: 'localhost',
  username: 'steel',
  privateKey: Buffer.from('...')
})
.then(function() {
  // Local, Remote
  ssh.putFile('/home/steel/Lab/localPath/fileName', '/home/steel/Lab/remotePath/fileName').then(function() {
    console.log("The File thing is done")
  }, function(error) {
    console.log("Something's wrong")
    console.log(error)
  })
  // Array<Shape('local' => string, 'remote' => string)>
  ssh.putFiles([{ local: '/home/steel/Lab/localPath/fileName', remote: '/home/steel/Lab/remotePath/fileName' }]).then(function() {
    console.log("The File thing is done")
  }, function(error) {
    console.log("Something's wrong")
    console.log(error)
  })
  // Local, Remote
  ssh.getFile('/home/steel/Lab/localPath', '/home/steel/Lab/remotePath').then(function(Contents) {
    console.log("The File's contents were successfully downloaded")
  }, function(error) {
    console.log("Something's wrong")
    console.log(error)
  })
  // Putting entire directories
  const failed = []
  const successful = []
  ssh.putDirectory('/home/steel/Lab', '/home/steel/Lab', {
    recursive: true,
    concurrency: 10,
    // ^ WARNING: Not all servers support high concurrency
    // try a bunch of values and see what works on your server
    validate: function(itemPath) {
      const baseName = path.basename(itemPath)
      return baseName.substr(0, 1) !== '.' && // do not allow dot files
             baseName !== 'node_modules' // do not allow node_modules
    },
    tick: function(localPath, remotePath, error) {
      if (error) {
        failed.push(localPath)
      } else {
        successful.push(localPath)
      }
    }
  }).then(function(status) {
    console.log('the directory transfer was', status ? 'successful' : 'unsuccessful')
    console.log('failed transfers', failed.join(', '))
    console.log('successful transfers', successful.join(', '))
  })
  // Command
  ssh.execCommand('hh_client --json', { cwd:'/var/www' }).then(function(result) {
    console.log('STDOUT: ' + result.stdout)
    console.log('STDERR: ' + result.stderr)
  })
  // Command with escaped params
  ssh.exec('hh_client', ['--json'], { cwd: '/var/www', stream: 'stdout', options: { pty: true } }).then(function(result) {
    console.log('STDOUT: ' + result)
  })
  // With streaming stdout/stderr callbacks
  ssh.exec('hh_client', ['--json'], {
    cwd: '/var/www',
    onStdout(chunk) {
      console.log('stdoutChunk', chunk.toString('utf8'))
    },
    onStderr(chunk) {
      console.log('stderrChunk', chunk.toString('utf8'))
    },
  })
})
```

#### API

```ts
// API reference in Typescript typing format:
import stream from 'stream'
import { Client, ConnectConfig, ClientChannel, SFTPWrapper, ExecOptions, PseudoTtyOptions | ShellOptions } from 'ssh2';
import { Prompt, TransferOptions } from 'ssh2-streams';
// ^ You do NOT need to import these package, these are here for reference of where the
// types are coming from.

declare type Config = ConnectConfig & {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    privateKeyPath?: string;
    privateKey?: string;
    passphrase?: string;
    tryKeyboard?: boolean;
    onKeyboardInteractive?: (
      name: string,
      instructions: string,
      lang: string,
      prompts: Prompt[],
      finish: (responses: string[]) => void
    ) => void;
};

interface SSHExecCommandOptions {
    cwd?: string;
    stdin?: string | stream.Readable;
    execOptions?: ExecOptions;
    encoding?: BufferEncoding;
    onChannel?: (clientChannel: ClientChannel) => void;
    onStdout?: (chunk: Buffer) => void;
    onStderr?: (chunk: Buffer) => void;
}

interface SSHExecCommandResponse {
    stdout: string;
    stderr: string;
    code: number | null;
    signal: string | null;
}

interface SSHExecOptions extends SSHExecCommandOptions {
    stream?: 'stdout' | 'stderr' | 'both';
}

interface SSHPutFilesOptions {
    sftp?: SFTPWrapper | null;
    concurrency?: number;
    transferOptions?: TransferOptions;
}

interface SSHGetPutDirectoryOptions extends SSHPutFilesOptions {
    tick?: (localFile: string, remoteFile: string, error: Error | null) => void;
    validate?: (path: string) => boolean;
    recursive?: boolean;
}

type SSHForwardInListener = (
  details: TcpConnectionDetails,
  accept: AcceptConnection<ClientChannel>,
  reject: RejectConnection,
) => void
interface SSHForwardInDetails {
  dispose(): Promise<void>
  port: number
}

type SSHForwardInStreamLocalListener = (
  info: UNIXConnectionDetails,
  accept: AcceptConnection,
  reject: RejectConnection,
) => void
interface SSHForwardInStreamLocalDetails {
  dispose(): Promise<void>
}

class NodeSSH {
    connection: Client | null;

    connect(config: Config): Promise<this>;

    isConnected(): boolean;

    requestShell(
      options?: PseudoTtyOptions | ShellOptions | false
    ): Promise<ClientChannel>;

    withShell(
      callback: (channel: ClientChannel) => Promise<void>,
      options?: PseudoTtyOptions | ShellOptions | false
    ): Promise<void>;

    requestSFTP(): Promise<SFTPWrapper>;

    withSFTP(
      callback: (sftp: SFTPWrapper) => Promise<void>
    ): Promise<void>;

    execCommand(
      command: string,
      options?: SSHExecCommandOptions
    ): Promise<SSHExecCommandResponse>;

    exec(
      command: string,
      parameters: string[],
      options?: SSHExecOptions & {
          stream?: 'stdout' | 'stderr';
      }
    ): Promise<string>;

    exec(
      command: string,
      parameters: string[],
      options?: SSHExecOptions & {
          stream: 'both';
      }
    ): Promise<SSHExecCommandResponse>;

    mkdir(
      path: string,
      method?: 'sftp' | 'exec',
      sftp?: SFTPWrapper | null
    ): Promise<void>;

    getFile(
      localFile: string,
      remoteFile: string,
      sftp?: SFTPWrapper | null,
      transferOptions?: TransferOptions | null
    ): Promise<void>;

    putFile(
      localFile: string,
      remoteFile: string,
      sftp?: SFTPWrapper | null,
      transferOptions?: TransferOptions | null
    ): Promise<void>;

    putFiles(files: Array<{
        local: string;
        remote: string;
    }>, options?: SSHPutFilesOptions): Promise<void>;

    putDirectory(
      localDirectory: string,
      remoteDirectory: string,
      options?: SSHGetPutDirectoryOptions
    ): Promise<boolean>;

    getDirectory(
      localDirectory: string,
      remoteDirectory: string,
      options?: SSHGetPutDirectoryOptions
    ): Promise<boolean>;


    forwardIn(
      remoteAddr: string,
      remotePort: number,
      onConnection?: SSHForwardInListener
    ): Promise<SSHForwardInDetails>;

    forwardOut(
      srcIP: string,
      srcPort: number,
      dstIP: string,
      dstPort: number
    ): Promise<Channel>;

    forwardInStreamLocal(
      socketPath: string,
      onConnection?: SSHForwardInStreamLocalListener,
    ): Promise<SSHForwardInStreamLocalDetails>;

    forwardOutStreamLocal(
      socketPath: string
    ): Promise<Channel>;

    dispose(): void;
}

module.exports = NodeSSH;
```

### Typescript support

`node-ssh` requires extra dependencies while working under Typescript. Please install them as shown below

```
yarn add --dev @types/ssh2
# OR
npm install --save-dev @types/ssh2
```

If you're still running into issues, try adding these to your `tsconfig.json`

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  }
}
```

### Keyboard-interactive user authentication

In some cases you have to enable keyboard-interactive user authentication.
Otherwise you will get an `All configured authentication methods failed` error.

#### Example:

```js
const password = 'test'

ssh.connect({
  host: 'localhost',
  username: 'steel',
  port: 22,
  password,
  tryKeyboard: true,
})

// Or if you want to add some custom keyboard-interactive logic:

ssh.connect({
  host: 'localhost',
  username: 'steel',
  port: 22,
  tryKeyboard: true,
  onKeyboardInteractive(name, instructions, instructionsLang, prompts, finish) {
    if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
      finish([password])
    }
  }
})
```

For further information see: https://github.com/mscdex/ssh2/issues/604

### License
This project is licensed under the terms of MIT license. See the LICENSE file for more info.

[ssh2]:https://github.com/mscdex/ssh2
