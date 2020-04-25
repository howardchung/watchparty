# Enable kernel modules on the host
modprobe snd-aloop

# Install gstreamer
apt-get install -y libgstreamer1.0-0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav gstreamer1.0-doc gstreamer1.0-tools gstreamer1.0-x gstreamer1.0-alsa gstreamer1.0-gl gstreamer1.0-gtk3 gstreamer1.0-qt5 gstreamer1.0-pulseaudio

# Inside container: ALSA to view sound devices with aplay -l
apt-get install -y libasound2 alsa-utils alsa-oss
apt-get install -y pulseaudio

# Rebuild our container
docker build . -t browseparty/chrome

# Run our services
# Start chrome + VNC, sharing audio device
docker run -d -p 5900:5900 --rm --name chrome --device /dev/snd -e VNC_PASSWORD="password" -e VNC_SCREEN_SIZE="1280x720" -e CHROME_OPTS_OVERRIDE=" --user-data-dir --no-sandbox --no-first-run --window-position=0,0 --force-device-scale-factor=1 --disable-dev-shm-usage" browseparty/chrome

# Proxy the VNC from TCP to WebSocket
docker run -d -it --rm --net=host --name websockify efrecon/websockify 5000 localhost:5900

# Audio test
speaker-test -D hw:0,0,0 --channels 2 --rate 48000

# Stream the audio to a TCP sink
gst-launch-1.0 -v alsasrc device=hw:0,1,0 ! audio/x-raw, channels=2, rate=48000 ! opusenc complexity=0 ! oggmux ! tcpserversink port=5901 host=0.0.0.0
gst-launch-1.0 -v alsasrc device=hw:0,1,0 ! audio/x-raw, channels=2, rate=48000 ! audioconvert ! lamemp3enc ! tcpserversink port=5901 host=0.0.0.0

# Proxy the audio from TCP to WebSocket
docker run -d -it --rm --net=host --name websockify-audio efrecon/websockify 5001 localhost:5901
