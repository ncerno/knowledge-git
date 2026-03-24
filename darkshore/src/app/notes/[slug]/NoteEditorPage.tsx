"use client";
import NoteEditor from "@/components/NoteEditor";

interface Props { nodeId: string; nodeTitle: string; nodeCategory: string; }

export default function NoteEditorPage({ nodeId, nodeTitle, nodeCategory }: Props) {
  return <NoteEditor nodeId={nodeId} nodeTitle={nodeTitle} nodeCategory={nodeCategory} />;
}

