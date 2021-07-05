// import {Runtime} from './runtimes';
// import {ServiceConfiguration} from './index';

// function startApp(runtime: Runtime, serviceConfig: ServiceConfiguration ) {
//   try {
//     let command = '';
//     if (serviceConfig.runtime === 'nodejs14') {
//       command = 'node';
//     } else {
//       throw Error(`Invalid runtime for ${serviceConfig.service}`);
//     }

//     const currentPortMap = addPortMap(serviceConfig.service, index);
//     console.log('Here:', currentPortMap);

//     // const subprocess = spawn(command, [path.join(process.cwd(), `${serviceConfig.path}/index.js`)], {
//     //   cwd: `${process.cwd()}`,
//     //   env: {
//     //     PATH: process.env.path,
//     //     PORT: String(currentPortMap.PORT),
//     //   },
//     // });

//     const cmd = 'echo hellothere && node test/ace/index.js';
//     const cmdarray = cmd.split(' ');
//     // let command = spawn(cmdarray.shift(), cmdarray);
//     const subprocess = spawn(cmdarray.shift() ?? '', cmdarray, {
//       cwd: `${process.cwd()}`,
//       env: {
//         PATH: process.env.path,
//         PORT: String(currentPortMap.PORT),
//       },
//     });

//     const prefix = serviceConfig.colorStyle(`[${currentPortMap.index}] ${serviceConfig.service}`.padEnd(15) + '|');

//     subprocess.stdout.on('data', (data) => {
//       const lines = `${data}`.split('\n').filter((x) => x!='');

//       lines.map((x: string) => console.log(prefix + `${x}`));
//     });

//     subprocess.on('error', (err) => {
//       console.log(prefix + `${err}`);
//     });

//     app.use(
//         serviceConfig.routes,
//         createProxyMiddleware({
//           target: `http://localhost:${currentPortMap.PORT}`,
//           changeOrigin: true,
//         }),
//     );

//     table.push([
//       currentPortMap.index,
//       serviceConfig.service,
//       `http://localhost:${currentPortMap.PORT}`,
//       `${serviceConfig.routes}`,
//     ]);

//     const result: ExecutionResult = {
//       success: true,
//       msg: `Service Running`,
//     };
//     return result;
//   } catch (e:any) {
//     const result: ExecutionResult = {
//       success: false,
//       msg: e,
//     };
//     return result;
//   };
// }
