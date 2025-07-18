import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import Home from "../../pages/Home";
import DappDetail from "../../pages/DappDetail";
import { AnimatePresence, motion } from "framer-motion";
import { Routes, Route, useLocation } from 'react-router-dom';
import Ecosystem from '../../pages/Ecosystem';
import Halving from '../../pages/Halving';
import Events from '../../pages/Events';
import Statistics from '../../pages/Statistics';

import Bulletin from '../bulletin/Bulletin'
import Footer from '../footer/Footer'
import Sidebar from '../sidebar/Sidebar'
import TopNav from '../TopNav/topNav'

// Scroll position memory and restoration hook for a scrollable container
const scrollPositions = {};
function useScrollRestoration(containerRef) {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  useLayoutEffect(() => {
    return () => {
      if (containerRef.current) {
        // Save scroll position for previous path
        // eslint-disable-next-line react-hooks/exhaustive-deps
        scrollPositions[prevPath.current] = containerRef.current.scrollTop;
      }
    };
  }, [containerRef, location.pathname]);

  useLayoutEffect(() => {
    if (containerRef.current) {
      if (scrollPositions[location.pathname] !== undefined) {
        containerRef.current.scrollTop = scrollPositions[location.pathname];
      } else {
        containerRef.current.scrollTop = 0;
      }
    }
    prevPath.current = location.pathname;
  }, [location.pathname, containerRef]);
}

export default function MainPage() {
  const contentRef = useRef(null);
  useScrollRestoration(contentRef);
  const location = useLocation();

  // Double detail modal stack state
  const [detailA, setDetailA] = useState({ dappId: null, visible: false });
  const [detailB, setDetailB] = useState({ dappId: null, visible: false });
  const [isAOnTop, setIsAOnTop] = useState(true);

  // Unified body overflow management: only restore when all details are closed
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const originalBg = document.body.style.background;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    const anyDetailOpen = detailA.visible || detailB.visible;
    if (anyDetailOpen) {
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.background = '#F8F7FA';
      }
    } else {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.body.style.background = originalBg;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.body.style.background = originalBg;
    };
  }, [detailA.visible, detailB.visible]);

  // Home/project entry click
  const handleShowDetail = (dappId) => {
    if (isAOnTop) {
      setDetailA({ dappId, visible: true });
      setDetailB({ dappId: null, visible: false });
    } else {
      setDetailB({ dappId, visible: true });
      setDetailA({ dappId: null, visible: false });
    }
  };

  // Related area click
  const handleRelatedClick = (dappId) => {
    if (isAOnTop) {
      setDetailA(a => ({ ...a, visible: false }));
      setDetailB({ dappId, visible: true });
      setIsAOnTop(false);
    } else {
      setDetailB(b => ({ ...b, visible: false }));
      setDetailA({ dappId, visible: true });
      setIsAOnTop(true);
    }
  };

  // Close detail
  const handleClose = () => {
    setDetailA(a => ({ ...a, visible: false }));
    setDetailB(b => ({ ...b, visible: false }));
  };

  return (
    <div className="flex flex-col">
      <div className="sidebar hidden md:block w-0 md:w-[260px] bg-[#1C1C23]">
        <Sidebar />
      </div>
      <div className="layout__content pl-0 md:ml-[260px] flex flex-col items-center overflow-auto" ref={contentRef}>
        <Bulletin />
        <TopNav />
        <div className="flex grow w-full justify-center">
          <div className="bg-[#F8F8F8] flex flex-col w-full">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home onDappSelect={handleShowDetail} />} />
              <Route path="/ecosystem" element={<Ecosystem />} />
              <Route path="/halving" element={<Halving />} />
              <Route path="/events" element={<Events />} />
              <Route path="/statistics" element={<Statistics />} />
              {/* New pages can be added here */}
            </Routes>
          </div>
        </div>
        <Footer></Footer>
        <div id="app-message-box" />
      </div>
      <AnimatePresence>
        {detailA.visible && (
          <motion.div
            key={`detailA-${detailA.dappId}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: isAOnTop ? 70 : 60
            }}
          >
            <DappDetail
              dappId={detailA.dappId}
              onClose={handleClose}
              onRelatedClick={handleRelatedClick}
            />
          </motion.div>
        )}
        {detailB.visible && (
          <motion.div
            key={`detailB-${detailB.dappId}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: isAOnTop ? 60 : 70
            }}
          >
            <DappDetail
              dappId={detailB.dappId}
              onClose={handleClose}
              onRelatedClick={handleRelatedClick}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
