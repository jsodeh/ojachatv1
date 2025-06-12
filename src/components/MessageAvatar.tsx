const MessageAvatar = ({ isAssistant }: { isAssistant: boolean }) => {
  if (isAssistant) {
    return (
      <div className="gizmo-shadow-stroke relative flex h-full items-center justify-center rounded-full bg-token-main-surface-primary text-token-text-primary">
        <img
          src="/assets/ojastack.png"
          alt="OjaStack"
          className="h-2/3 w-2/3"
        />
      </div>
    );
  }
  
  return null;
};

export default MessageAvatar;