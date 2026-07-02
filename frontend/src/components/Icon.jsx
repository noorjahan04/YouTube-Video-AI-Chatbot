import { Youtube, Send, Search, Star, Trash2, Copy, Download, LogOut, Moon, Sun, Home, Brain, Sparkles, X, Menu, ChevronRight, Check, Eye, EyeOff, ArrowLeft, Clock, MessageSquare, NotebookPen, Link2, Bot, RotateCw, FileText } from 'lucide-react'

const MAP = { youtube:Youtube, send:Send, search:Search, star:Star, trash:Trash2, copy:Copy, download:Download, logout:LogOut, moon:Moon, sun:Sun, home:Home, brain:Brain, sparkles:Sparkles, close:X, menu:Menu, chevronRight:ChevronRight, check:Check, eye:Eye, eyeOff:EyeOff, back:ArrowLeft, clock:Clock, chat:MessageSquare, notes:NotebookPen, link:Link2, ai:Bot, refresh:RotateCw, fileText:FileText }

export default function Icon({ name, size=18, style={}, strokeWidth=2 }) {
  const C = MAP[name]
  if (!C) return null
  return <C size={size} strokeWidth={strokeWidth} style={{ display:'inline-flex', flexShrink:0, ...style }} />
}
