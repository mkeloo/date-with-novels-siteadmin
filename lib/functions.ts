// functions.ts

export function buildTitle(title: string): string {
    return `${title} | Admin`
}


export function generateRandomGradient(): string {
    const colors = [
        "red",
        "orange",
        "amber",
        "yellow",
        "lime",
        "green",
        "emerald",
        "teal",
        "cyan",
        "sky",
        "blue",
        "indigo",
        "violet",
        "purple",
        "fuchsia",
        "pink",
        "rose"
    ];

    const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
    const gradientTypes = ["from-to", "from-via-to"];

    const type = gradientTypes[Math.floor(Math.random() * gradientTypes.length)];

    if (type === "from-to") {
        const fromColor = getRandomColor();
        let toColor = getRandomColor();
        while (toColor === fromColor) {
            toColor = getRandomColor();
        }
        return `from-${fromColor}-500 to-${toColor}-500`;
    }

    // type === "from-via-to"
    const fromColor = getRandomColor();
    let viaColor = getRandomColor();
    let toColor = getRandomColor();

    // Ensure uniqueness
    while (viaColor === fromColor) {
        viaColor = getRandomColor();
    }

    while (toColor === viaColor || toColor === fromColor) {
        toColor = getRandomColor();
    }

    return `from-${fromColor}-500 via-${viaColor}-500 to-${toColor}-500`;
}


/**
 * Generates a grid-based scatter by dividing the area into rows & columns
 * and placing an emoji in each cell with a smaller random offset
 * so the layout looks more uniform (less big gaps).
 *
 * @param emojiList The array of emojis to pick from
 * @param row Number of rows
 * @param col Number of columns
 * @returns An array of { emoji, top, left } objects
 */
export function generateRandomEmojiScatter(
    emojiList: string[],
    row: number,
    col: number
): { emoji: string; top: number; left: number }[] {
    if (!emojiList.length) {
        emojiList = ["❤️"] // fallback
    }

    const rowCount = row
    const colCount = col
    const total = rowCount * colCount

    const scatter = []
    for (let i = 0; i < total; i++) {
        // Determine which cell we’re in
        const currentRow = Math.floor(i / colCount)
        const currentCol = i % colCount

        /**
         * We limit the random offset to [0.3..0.7], so each emoji is near
         * the center of its cell, avoiding huge gaps or collisions at edges.
         */
        const rowOffset = 0.3 + Math.random() * 0.1 // e.g. 0.3..0.7
        const colOffset = 0.3 + Math.random() * 1.2 // e.g. 0.3..1.5 (wider range for more spread)

        // Convert to percentage of container
        const top = ((currentRow + rowOffset) / rowCount) * 100
        const left = ((currentCol + colOffset) / colCount) * 100

        // Pick a random emoji from the list
        const index = Math.floor(Math.random() * emojiList.length)

        scatter.push({
            emoji: emojiList[index],
            top,
            left,
        })
    }

    return scatter
}

