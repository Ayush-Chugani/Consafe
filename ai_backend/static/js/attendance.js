(() => {
  const registerForm = document.getElementById("register-form");
  const markForm = document.getElementById("mark-form");
  const cameraVideo = document.getElementById("camera-video");
  const cameraCanvas = document.getElementById("camera-canvas");
  const cameraState = document.getElementById("camera-state");
  const startCameraBtn = document.getElementById("start-camera");
  const stopCameraBtn = document.getElementById("stop-camera");

  const registerInput = document.getElementById("register-captured-image");
  const markInput = document.getElementById("mark-captured-image");
  const registerPreview = document.getElementById("register-preview");
  const markPreview = document.getElementById("mark-preview");
  const registerStatus = document.getElementById("register-capture-status");
  const markStatus = document.getElementById("mark-capture-status");
  const captureRegisterBtn = document.getElementById("capture-register");
  const captureMarkBtn = document.getElementById("capture-mark");

  let stream = null;

  const setState = (text) => {
    if (cameraState) {
      cameraState.textContent = text;
    }
  };

  const ensureCamera = async () => {
    if (stream) {
      return stream;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      if (cameraVideo) {
        cameraVideo.srcObject = stream;
      }
      setState("Camera live");
      return stream;
    } catch (error) {
      setState("Camera access denied or unavailable");
      return null;
    }
  };

  const stopCamera = () => {
    if (!stream) {
      setState("Camera idle");
      return;
    }
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
    if (cameraVideo) {
      cameraVideo.srcObject = null;
    }
    setState("Camera stopped");
  };

  const captureFrame = async () => {
    const active = await ensureCamera();
    if (!active || !cameraVideo || !cameraCanvas) {
      return "";
    }

    const rawWidth = cameraVideo.videoWidth || 640;
    const rawHeight = cameraVideo.videoHeight || 360;
    const maxWidth = 800;
    const scale = rawWidth > maxWidth ? maxWidth / rawWidth : 1;
    const width = Math.max(320, Math.round(rawWidth * scale));
    const height = Math.max(240, Math.round(rawHeight * scale));
    cameraCanvas.width = width;
    cameraCanvas.height = height;
    const ctx = cameraCanvas.getContext("2d");
    if (!ctx) {
      return "";
    }
    ctx.drawImage(cameraVideo, 0, 0, width, height);
    return cameraCanvas.toDataURL("image/jpeg", 0.82);
  };

  if (startCameraBtn) {
    startCameraBtn.addEventListener("click", async () => {
      await ensureCamera();
    });
  }

  if (stopCameraBtn) {
    stopCameraBtn.addEventListener("click", stopCamera);
  }

  if (captureRegisterBtn) {
    captureRegisterBtn.addEventListener("click", async () => {
      const dataUrl = await captureFrame();
      if (!dataUrl) {
        if (registerStatus) {
          registerStatus.textContent = "Capture failed";
        }
        return;
      }
      if (registerInput) {
        registerInput.value = dataUrl;
      }
      if (registerPreview) {
        registerPreview.src = dataUrl;
        registerPreview.hidden = false;
      }
      if (registerStatus) {
        registerStatus.textContent = `Captured at ${new Date().toLocaleTimeString()}`;
      }
    });
  }

  if (captureMarkBtn) {
    captureMarkBtn.addEventListener("click", async () => {
      const dataUrl = await captureFrame();
      if (!dataUrl) {
        if (markStatus) {
          markStatus.textContent = "Capture failed";
        }
        return;
      }
      if (markInput) {
        markInput.value = dataUrl;
      }
      if (markPreview) {
        markPreview.src = dataUrl;
        markPreview.hidden = false;
      }
      if (markStatus) {
        markStatus.textContent = `Captured at ${new Date().toLocaleTimeString()}`;
      }
    });
  }

  const setSubmitButtonState = (form, submitting, submittingText, normalText) => {
    if (!form) {
      return;
    }
    const button = form.querySelector("button[type='submit']");
    if (!button) {
      return;
    }
    button.disabled = submitting;
    button.textContent = submitting ? submittingText : normalText;
  };

  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      if (!registerInput || !registerInput.value) {
        event.preventDefault();
        setSubmitButtonState(registerForm, false, "Registering worker...", "Register Worker");
        if (registerStatus) {
          registerStatus.textContent = "Capture a live image first";
        }
        return;
      }
      setSubmitButtonState(registerForm, true, "Registering worker...", "Register Worker");
    });
  }

  if (markForm) {
    markForm.addEventListener("submit", (event) => {
      if (!markInput || !markInput.value) {
        event.preventDefault();
        setSubmitButtonState(markForm, false, "Marking attendance...", "Mark Attendance");
        if (markStatus) {
          markStatus.textContent = "Capture a live image first";
        }
        return;
      }
      setSubmitButtonState(markForm, true, "Marking attendance...", "Mark Attendance");
    });
  }

  window.addEventListener("beforeunload", () => {
    stopCamera();
  });
})();
