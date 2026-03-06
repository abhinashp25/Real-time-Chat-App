
function MessageTicks({ message }) {
  // Still being sent (optimistic UI — hasn't reached the server yet)
  if (message.isOptimistic) {
    return (
      <span className="inline-flex items-center opacity-60" title="Sending...">
        {/* Clock icon — simple SVG, no extra dependency needed */}
        <svg
          className="w-3 h-3 animate-pulse"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </span>
    );
  }

  if (message.isRead) {
    // Double tick — cyan, meaning the receiver has seen the message
    return (
      <span
        className="inline-flex items-center text-cyan-300"
        title="Read"
        aria-label="Read"
      >
        {/* Two overlapping check marks */}
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Back tick — slightly offset left */}
          <polyline points="2 13 7 18 16 7" />
          {/* Front tick — offset right */}
          <polyline points="8 13 13 18 22 7" />
        </svg>
      </span>
    );
  }

  // Single tick — grey, message delivered to server but not yet read
  return (
    <span
      className="inline-flex items-center opacity-60"
      title="Sent"
      aria-label="Sent"
    >
      <svg
        className="w-3.5 h-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="5 13 10 18 20 7" />
      </svg>
    </span>
  );
}

export default MessageTicks;
