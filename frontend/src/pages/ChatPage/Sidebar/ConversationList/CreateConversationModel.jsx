import React, { useState } from "react";

const CreateConversationModal = ({ onClose, onSubmit }) => {
  const [type, setType] = useState("private");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [members, setMembers] = useState([]);
  const [inputUser, setInputUser] = useState("");

  /*
  ==========================
  ADD MEMBER
  ==========================
  */
  const addMember = () => {
    if (!inputUser.trim()) return;

    if (members.includes(inputUser)) return;

    if (members.length >= 100) {
      alert("Max 100 members allowed");
      return;
    }

    setMembers([...members, inputUser]);
    setInputUser("");
  };

  /*
  ==========================
  REMOVE MEMBER
  ==========================
  */
  const removeMember = (id) => {
    setMembers(members.filter((m) => m !== id));
  };

  /*
  ==========================
  SUBMIT
  ==========================
  */
  const handleSubmit = () => {
    // PRIVATE
    if (type === "private") {
      if (members.length !== 1) {
        alert("Select exactly 1 user");
        return;
      }

      onSubmit({
        type,
        members,
      });
      return;
    }

    // PRIVATE GROUP
    if (type === "private-group") {
      if (!name.trim()) {
        alert("Group name required");
        return;
      }

      if (members.length === 0) {
        alert("Add at least 1 member");
        return;
      }

      onSubmit({
        type,
        name,
        description,
        members,
      });
      return;
    }

    // PUBLIC GROUP
    if (type === "free-group") {
      if (!name.trim()) {
        alert("Group name required");
        return;
      }

      onSubmit({
        type,
        name,
        description,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded shadow w-[350px]">
        <h2 className="text-lg font-semibold mb-4">
          Create Conversation
        </h2>

        {/* TYPE SELECT */}
        <select
          className="w-full mb-3 border p-2 rounded"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setMembers([]);
          }}
        >
          <option value="private">Private Chat</option>
          <option value="private-group">Private Group</option>
          <option value="free-group">Public Group</option>
        </select>

        {/* NAME */}
        {type !== "private" && (
          <input
            className="w-full mb-3 border p-2 rounded"
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        {/* DESCRIPTION */}
        {type !== "private" && (
          <textarea
            className="w-full mb-3 border p-2 rounded"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        )}

        {/* MEMBERS INPUT */}
        {type !== "free-group" && (
          <>
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 border p-2 rounded"
                placeholder="Enter user ID"
                value={inputUser}
                onChange={(e) => setInputUser(e.target.value)}
              />
              <button
                className="px-3 bg-blue-500 text-white rounded"
                onClick={addMember}
              >
                Add
              </button>
            </div>

            {/* MEMBER LIST */}
            <div className="flex flex-wrap gap-2 mb-3">
              {members.map((m) => (
                <div
                  key={m}
                  className="bg-gray-200 px-2 py-1 rounded flex items-center gap-1"
                >
                  {m}
                  <button onClick={() => removeMember(m)}>✕</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>

          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateConversationModal;