-- CreateTable
CREATE TABLE "FriendGroupRequest" (
    "id" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "status" "GroupStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FriendGroupRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FriendGroupRequest_senderId_groupId_key" ON "FriendGroupRequest"("senderId", "groupId");

-- AddForeignKey
ALTER TABLE "FriendGroupRequest" ADD CONSTRAINT "FriendGroupRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendGroupRequest" ADD CONSTRAINT "FriendGroupRequest_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "FriendGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
