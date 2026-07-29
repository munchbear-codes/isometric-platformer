// Compact RLE String Key for fast data array unpacking:
// 'W' = Solid Wall (1), 'A' = Air (0), 'D' = Doorway Trigger (10)
const LOBBY_MATRIX_COMPRESSED = [
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // Row 0: Top Ceiling
    "WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAW", // Row 1: Storey 1 Air
    "WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAW", // Row 2: Storey 1 Air
    "WAAAAADAAAAAAAAAADAADAAAAAAAAAADAAAAAW", // Row 3: S1 Doors (Col 6, 17, 31)
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWAAAW", // Row 4: Floor 1 (Drop Right)
    "WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAW", // Row 5: Storey 2 Air
    "WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAW", // Row 6: Storey 2 Air
    "WAAADAAAAAAAAAADAADAAAAAAAAAADAAAAAAAW", // Row 7: S2 Doors (Col 4, 15, 29)
    "WAAAWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // Row 8: Floor 2 (Drop Left)
    "WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAW", // Row 9: Storey 3 Air
    "WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAW", // Row 10: Storey 3 Air
    "WAAAAADAAAAAAAAAADAADAAAAAAAAAADAAAAAW", // Row 11: S3 Doors (Col 6, 17, 31)
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"  // Row 12: Solid Foundation
];

export const LobbyConfig = {
    DOOR_TILE_ID: 10,
    SPAWN_X: 2,
    SPAWN_Y: 2,
    
    /**
     * Unpacks compressed character strings into full numerical matrices
     * @returns {Array<Array<number>>}
     */
    getMapData() {
        const charToNum = { 'W': 1, 'A': 0, 'D': 10 };
        return LOBBY_MATRIX_COMPRESSED.map(rowString => 
            rowString.split("").map(char => charToNum[char] ?? 0)
        );
    }
};
