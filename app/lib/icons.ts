import type { LucideIcon } from "lucide-react";
import {
  Flame,
  HeartCrack,
  Sun,
  Moon,
  Heart,
  Flower2,
  Sparkles,
  Gem,
  Clock,
  MessageCircle,
  CreditCard,
  Gift,
  RotateCcw,
  Wrench,
  FileText,
  Smile,
  Frown,
  Angry,
  Meh,
  Laugh,
  AlertCircle,
  UserPlus,
  Hand,
  HeartHandshake,
} from "lucide-react";

// ── Scene Category Icons ─────────────────────────────────

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  popular: Flame,
  tsundere: HeartCrack,
  cheerful: Sun,
  mysterious: Moon,
  caring: Heart,
  shy: Flower2,
  flirty: Sparkles,
  cool: Gem,
  latest: Clock,
};

export function getCategoryIcon(key: string): LucideIcon {
  return CATEGORY_ICONS[key] ?? Sparkles;
}

// ── Transaction Icons ────────────────────────────────────

const TRANSACTION_ICONS: Record<string, LucideIcon> = {
  consumption: MessageCircle,
  purchase: CreditCard,
  bonus: Gift,
  refund: RotateCcw,
  adjustment: Wrench,
};

export function getTransactionIcon(type: string): LucideIcon {
  return TRANSACTION_ICONS[type] ?? FileText;
}

// ── Mood Icons ───────────────────────────────────────────

const MOOD_ICONS: Record<string, LucideIcon> = {
  happy: Smile,
  sad: Frown,
  angry: Angry,
  neutral: Meh,
  excited: Sparkles,
  shy: HeartCrack,
  playful: Laugh,
  serious: Meh,
  worried: AlertCircle,
};

export function getMoodIcon(mood: string): LucideIcon {
  return MOOD_ICONS[mood] ?? Meh;
}

// ── Relationship Icons ───────────────────────────────────

const RELATIONSHIP_ICONS: Record<string, LucideIcon> = {
  stranger: UserPlus,
  acquaintance: Hand,
  friend: Heart,
  close_friend: HeartHandshake,
};

export function getRelationshipIcon(level: string): LucideIcon {
  return RELATIONSHIP_ICONS[level] ?? UserPlus;
}
