const video = document.getElementById("camera-feed");
const startButton = document.getElementById("start-button");
const message = document.getElementById("message");

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: "environment"
        },
        width: {
          ideal: 1280
        },
        height: {
          ideal: 720
        }
      },
      audio: false
    });

    video.srcObject = stream;

    message.innerText = "摄像头已开启。现在你看到的是：现实摄像头画面 + 网页里的虚拟物体。";
    startButton.style.display = "none";
  } catch (error) {
    console.error("Camera error:", error);

    message.innerText =
      "无法打开摄像头。请检查：1. 是否允许浏览器访问摄像头；2. 是否使用 HTTPS 或 localhost；3. 手机浏览器是否支持摄像头调用。";
  }
}

startButton.addEventListener("click", startCamera);