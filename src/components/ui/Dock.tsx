"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Children,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FileText, Target, User, CheckCircle, House, FolderOpen, LogOut, Crown, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

import "./Dock.css";

interface DockItemData {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  url?: string;
  badge?: number;
  isPremium?: boolean;
  className?: string;
}

function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  isActive = false,
}) {
  const ref = useRef(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val: number) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`dock-item ${className} ${isActive ? 'active' : ''}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, (child) =>
        cloneElement(child, { isHovered })
      )}
    </motion.div>
  );
}

function DockLabel({ children, className = "", ...rest }) {
  const { isHovered } = rest;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`dock-label ${className}`}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = "", badge, isPremium }) {
  return (
    <div className={`dock-icon ${className}`}>
      {children}
      {badge && badge > 0 && (
        <div className="dock-badge">
          {badge > 99 ? '99+' : badge}
        </div>
      )}
      {isPremium && (
        <div className="dock-premium-badge">
          <Crown size={8} />
        </div>
      )}
    </div>
  );
}

export default function Dock({
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  dockHeight = 256,
  baseItemSize = 50,
}) {
  const { user, signOut } = useAuth();
  const { isPremium, isLoading: statusLoading } = useSubscriptionStatus();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();


  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);



  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const mainMenuItems: DockItemData[] = [
    { 
      icon: <House size={isMobile ? 20 : 18} />, 
      label: 'Inicio', 
      onClick: () => navigate('/app'),
      url: '/app'
    },
    { 
      icon: <FileText size={isMobile ? 20 : 18} />, 
      label: 'Editor de CVs', 
      onClick: () => navigate('/app/cv-selector'),
      url: '/app/cv-selector'
    },
    { 
      icon: <Target size={isMobile ? 20 : 18} />, 
      label: 'Match de Ofertas', 
      onClick: () => navigate('/app/match'),
      url: '/app/match'
    },
    { 
      icon: <FolderOpen size={isMobile ? 20 : 18} />, 
      label: 'Mis Currículums', 
      onClick: () => navigate('/app/cvs'),
      url: '/app/cvs'
    },
    { 
      icon: <CheckCircle size={isMobile ? 20 : 18} />, 
      label: 'Seguimiento', 
      onClick: () => navigate('/app/kanban'),
      url: '/app/kanban'
    },
  ];

  const profileItems: DockItemData[] = [
    { 
      icon: <User size={isMobile ? 20 : 18} />, 
      label: 'Mi Perfil', 
      onClick: () => navigate('/app/profile'),
      url: '/app/profile',
      isPremium: isPremium
    },
  ];

  const adminItems: DockItemData[] = isAdmin ? [
    { 
      icon: <LayoutDashboard size={isMobile ? 20 : 18} />, 
      label: 'Admin Panel', 
      onClick: () => navigate('/admin'),
      url: '/admin'
    },
  ] : [];

  const logoutItem: DockItemData = {
    icon: <LogOut size={isMobile ? 20 : 18} />,
    label: 'Cerrar Sesión',
    onClick: handleSignOut
  };

  const allItems = [...mainMenuItems, ...profileItems, ...adminItems, logoutItem];

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight]
  );
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  if (!user) return null;

  return (
    <motion.div
      style={{ height, scrollbarWidth: "none" }}
      className="dock-outer"
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={`dock-panel ${className}`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {allItems.map((item, index) => {
          const isActive = item.url ? location.pathname === item.url : false;
          
          return (
            <DockItem
              key={index}
              onClick={item.onClick}
              className={item.className}
              mouseX={mouseX}
              spring={spring}
              distance={distance}
              magnification={magnification}
              baseItemSize={baseItemSize}
              isActive={isActive}
            >
              <DockIcon badge={item.badge} isPremium={item.isPremium}>
                {item.icon}
              </DockIcon>
              <DockLabel>{item.label}</DockLabel>
            </DockItem>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
