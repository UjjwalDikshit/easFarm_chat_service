const isBlocked = await Block.findOne({
  $or: [
    { blockerId: creatorId, blockedId: otherUser },
    { blockerId: otherUser, blockedId: creatorId },
  ],
});

if (isBlocked) {
  return res.status(403).json({
    error: "User is blocked",
  });
}