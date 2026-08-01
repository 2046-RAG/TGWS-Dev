'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Next.js App Router 客户端导航不会自动滚动到 hash 锚点。
 * 此组件在路由变化后检测 location.hash 并平滑滚动到对应元素。
 */
export default function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    // 等待页面渲染完成（客户端组件 fetch 数据后元素才出现）
    const tryScroll = (attempt = 0) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (attempt < 30) {
        setTimeout(() => tryScroll(attempt + 1), 200);
      }
    };
    // 首次尝试延迟，给客户端数据加载留时间
    setTimeout(() => tryScroll(), 300);
  }, [pathname]);

  return null;
}
