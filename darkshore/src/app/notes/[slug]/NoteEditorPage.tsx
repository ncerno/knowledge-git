"use client";
import NoteEditor from "@/components/NoteEditor";

interface Props {
  slug: string;
  nodeId: string;
  nodeTitle: string;
  nodeCategory: string;
  initialNotes: { id: string; title: string; content: string; summary?: string | null; wordCount: number; version: number; createdAt: string; updatedAt: string }[];
}

export default function NoteEditorPage({ slug, nodeId, nodeTitle, nodeCategory, initialNotes }: Props) {
  return <NoteEditor slug={slug} nodeId={nodeId} nodeTitle={nodeTitle} nodeCategory={nodeCategory} initialNotes={initialNotes} />;
}

