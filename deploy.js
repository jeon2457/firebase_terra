// deploy.js
const { spawn } = require("child_process");

// 공통 실행 함수
function runCommand(command, args, cwd, callback) {
  console.log(`실행 중: ${command} ${args.join(" ")}`);
  const child = spawn(command, args, { cwd, shell: true });

  child.stdout.on("data", (data) => {
    console.log(data.toString());
  });

  child.stderr.on("data", (data) => {
    console.error(data.toString());
  });

  child.on("close", (code) => {
    console.log(`${command} 종료 (코드: ${code})`);
    if (callback) callback();
  });
}

// 실행할 디렉터리
const projectDir = "C:\\firebase_terraone-site\\terraone-site";

// 1. firebase login (대화형, 최초 1회는 수동 입력 필요)
runCommand("firebase", ["login"], projectDir, () => {
  // 2. firebase deploy
  runCommand("firebase", ["deploy"], projectDir, () => {
    console.log("배포 완료!");
  });
});