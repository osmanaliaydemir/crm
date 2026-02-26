"use client"

import { motion } from "framer-motion"

export function MeshGradient() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-40">
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-[120px]"
            />
            <motion.div
                animate={{
                    x: [0, -80, 0],
                    y: [0, 100, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[100px]"
            />
            <motion.div
                animate={{
                    x: [0, 50, 0],
                    y: [0, -100, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] rounded-full bg-indigo-500/10 blur-[110px]"
            />
        </div>
    )
}
