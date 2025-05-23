import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    hue: number;
}

const ParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const particlesRef = useRef<Particle[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // 初始化粒子
        const initParticles = () => {
            const particles: Particle[] = [];
            const particleCount = Math.min(40, Math.floor((canvas.width * canvas.height) / 20000));
            
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    size: Math.random() * 1.5 + 0.5,
                    opacity: Math.random() * 0.3 + 0.1,
                    hue: Math.random() * 60 + 200 // 蓝色到紫色范围
                });
            }
            
            particlesRef.current = particles;
        };

        initParticles();

        // 检测主题
        const getTheme = () => {
            return document.documentElement.getAttribute('data-theme') || 'dark';
        };

        // 动画循环
        const animate = () => {
            const theme = getTheme();
            const isDark = theme === 'dark';
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 更新和绘制粒子
            particlesRef.current.forEach((particle, index) => {
                // 更新位置
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // 边界检测
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                
                // 保持在画布内
                particle.x = Math.max(0, Math.min(canvas.width, particle.x));
                particle.y = Math.max(0, Math.min(canvas.height, particle.y));
                
                // 根据主题调整透明度和颜色
                const baseOpacity = isDark ? particle.opacity : particle.opacity * 0.6;
                const hueOffset = isDark ? 0 : 20; // 浅色模式下调整色相
                const saturation = isDark ? 70 : 50;
                const lightness = isDark ? 60 : 40;
                
                // 绘制粒子
                ctx.save();
                ctx.globalAlpha = baseOpacity;
                ctx.beginPath();
                
                // 创建径向渐变
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size * 2.5
                );
                gradient.addColorStop(0, `hsla(${particle.hue + hueOffset}, ${saturation}%, ${lightness}%, 1)`);
                gradient.addColorStop(1, `hsla(${particle.hue + hueOffset}, ${saturation}%, ${lightness}%, 0)`);
                
                ctx.fillStyle = gradient;
                ctx.arc(particle.x, particle.y, particle.size * 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                
                // 连接附近的粒子
                particlesRef.current.forEach((otherParticle, otherIndex) => {
                    if (index === otherIndex) return;
                    
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        const connectionOpacity = (1 - distance / 100) * (isDark ? 0.15 : 0.08);
                        ctx.save();
                        ctx.globalAlpha = connectionOpacity;
                        ctx.strokeStyle = `hsla(${(particle.hue + otherParticle.hue) / 2 + hueOffset}, ${saturation}%, ${lightness}%, 1)`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.stroke();
                        ctx.restore();
                    }
                });
            });
            
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <motion.canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ 
                background: 'transparent',
                mixBlendMode: 'screen'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
        />
    );
};

export default ParticleBackground; 