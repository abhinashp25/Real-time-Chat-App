import { useRef, useState, useEffect } from "react";
import { X, Send, Trash } from "lucide-react";
import { motion } from "framer-motion";

export default function SketchCanvas({ onSend, onCancel }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const strokeColor = "#a78bfa"; // Cyber Violet / light purple

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    // Ensure transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = strokeColor;
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // Use scaling format in case canvas actual size != display size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.closePath();
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSend = () => {
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onSend(dataUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-[60px] left-2 right-2 md:left-4 md:right-4 z-50 pointer-events-auto"
    >
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-3 shadow-[0_16px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-[#f8fafc] text-[13px] font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#a78bfa] shadow-[0_0_8px_#a78bfa]"></span>
            Live Sketch
          </span>
          <button onClick={onCancel} className="text-[#94a3b8] hover:text-white transition-colors p-1 bg-white/5 rounded-full">
             <X size={16} />
          </button>
        </div>
        
        <div className="rounded-xl overflow-hidden bg-[#050505] border border-white/5 relative">
          <canvas
            ref={canvasRef}
            width={600}
            height={300}
            className="w-full h-[200px] touch-none cursor-crosshair"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseOut={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
          {/* Subtle grid background for realistic feel */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
        </div>

        <div className="flex justify-between items-center mt-3">
          <button onClick={handleClear} className="w-9 h-9 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all">
            <Trash size={15} />
          </button>
          
          <button onClick={handleSend} className="px-4 py-2 rounded-full bg-[#6366f1] text-white text-[13.5px] font-medium flex items-center gap-2 shadow-[0_4px_15px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.6)] hover:bg-[#4f46e5] transition-all">
             Attach Sketch <Send size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
