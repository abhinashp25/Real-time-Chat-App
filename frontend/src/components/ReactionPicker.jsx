const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

function ReactionPicker({ messageId, currentUserReaction, onReact }) {
  return (
    <div
      className="absolute -top-9 flex items-center gap-1 bg-slate-800 border border-slate-700
                 rounded-full px-2 py-1 shadow-lg z-10 opacity-0 group-hover:opacity-100
                 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto"
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReact(messageId, emoji)}
          title={emoji}
          className={`text-base leading-none hover:scale-125 transition-transform p-0.5 rounded
            ${currentUserReaction === emoji ? "bg-cyan-500/30 ring-1 ring-cyan-400" : ""}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export default ReactionPicker;
