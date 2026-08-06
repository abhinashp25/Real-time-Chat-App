const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

function ReactionPicker({ messageId, currentUserReaction, onReact }) {
  return (
    <div
      className="absolute -top-9 flex items-center gap-1 rounded-full px-2 py-1 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto"
      style={{
        background: "var(--bg-panel)",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)"
      }}
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReact(messageId, emoji)}
          title={emoji}
          className="text-base leading-none hover:scale-125 transition-transform p-1 rounded-full cursor-pointer"
          style={{
            background: currentUserReaction === emoji ? "var(--accent-dim)" : "transparent",
            outline: currentUserReaction === emoji ? "1px solid var(--accent)" : "none"
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export default ReactionPicker;
