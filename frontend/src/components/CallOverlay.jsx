import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCallStore } from "../store/useCallStore";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

export default function CallOverlay() {
  const {
    callState, incomingCall, localStream, remoteStream,
    answerCall, rejectCall, endCall, toggleMute, toggleVideo,
    isMuted, isVideoOff
  } = useCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callState === "IDLE" && !incomingCall) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-3xl overflow-hidden"
      >
        {/* Remote Video Background */}
        {remoteStream && !isVideoOff && (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Local Video PIP */}
        {localStream && callState === "IN_CALL" && (
          <motion.div
            drag
            dragConstraints={{ top: 20, left: 20, right: 300, bottom: 300 }}
            className="absolute top-8 right-8 w-40 h-56 bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20 z-10 cursor-move"
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          </motion.div>
        )}

        {/* Incoming Call UI */}
        {callState === "RINGING" && incomingCall && (
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-premium-indigo to-premium-cyan p-1 mb-6 shadow-premium-heavy animate-pulse">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-bold text-white">
                {incomingCall.name[0]}
              </div>
            </div>
            <h2 className="text-3xl font-semibold text-white mb-2">{incomingCall.name}</h2>
            <p className="text-gray-400 mb-12">Incoming {incomingCall.isVideo ? "Video" : "Voice"} Call...</p>
            
            <div className="flex gap-8">
              <button
                onClick={rejectCall}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
              >
                <PhoneOff size={28} />
              </button>
              <button
                onClick={answerCall}
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 animate-bounce"
              >
                <Phone size={28} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Outgoing Call UI */}
        {callState === "RINGING" && !incomingCall && (
          <motion.div className="relative z-10 flex flex-col items-center">
            <h2 className="text-2xl font-semibold text-white mb-2">Calling...</h2>
            <div className="flex gap-8 mt-12">
              <button
                onClick={() => endCall(true)}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
              >
                <PhoneOff size={28} />
              </button>
            </div>
          </motion.div>
        )}

        {/* In-Call Controls */}
        {callState === "IN_CALL" && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 rounded-full bg-glass-bg border border-glass-border backdrop-blur-xl shadow-glass z-20">
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>

            <div className="w-px h-8 bg-white/20 mx-2" />

            <button
              onClick={() => endCall(true)}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-transform hover:scale-110"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
