/* =================================================================
         pixel-art sprite engine: maps -> crisp SVG
      ================================================================= */
      const M = {
        txt: [
          '................', '...##########...', '...#WWWWWWWW#...', '...#WWWWWWWW#...',
          '...#WWWWWWWW#...', '...#WLLLLLLW#...', '...#WWWWWWWW#...', '...#WLLLLLLW#...',
          '...#WWWWWWWW#...', '...#WLLLLLLW#...', '...#WWWWWWWW#...', '...#WLLLLLLW#...',
          '...#WWWWWWWW#...', '...#WLLLLWWW#...', '...##########...', '................'],
        folder: [
          '................', '.########.......', '.#yyyyyy#.......', '################',
          '#WWWWWWWWWWWWWW#', '#YYYYYYYYYYYYYY#', '#YYYYYYYYYYYYYY#', '#YYYYYYYYYYYYYY#',
          '#YYYYYYYYYYYYYY#', '#YYYYYYYYYYYYYY#', '#YYYYYYYYYYYYYY#', '#YYYYYYYYYYYYYY#',
          '#YYYYYYYYYYYYYY#', '#yyyyyyyyyyyyyy#', '################', '................'],
        monitor: [
          '................', '.##############.', '.#BBBBBBBBBBBB#.', '.#BB########BB#.',
          '.#BB#ssssss#BB#.', '.#BB#sGssss#BB#.', '.#BB#ssGsss#BB#.', '.#BB#sGssss#BB#.',
          '.#BB#sGGGGs#BB#.', '.#BB#ssssss#BB#', '.#BBBBBBBBBBBB#.', '.##############.',
          '......####......', '.....######.....', '................', '................'],
        gear: [
          '................', '.HH..........HH.', '.HH..........HH.', '..HHHHHHHHHHHH..',
          '..HHHHHHHHHHHH..', '...HHH....HHH...', 'HHHHHH....HHHHHH', 'HHHHHH....HHHHHH',
          'GGGGGG....GGGGGG', 'GGGGGG....GGGGGG', '...GGG....GGG...', '..GGGGGGGGGGGG..',
          '..GGGGGGGGGGGG..', '.GG..........GG.', '.GG..........GG.', '................'],
        pdf: [
          '................', '...##########...', '...#RRRRRRRR#...', '...#RRRRRRRR#...',
          '...#RRRRRRRR#...', '...#WWWWWWWW#...', '...#WKKKKKKW#...', '...#WWWWWWWW#...',
          '...#WKKKKKKW#...', '...#WWWWWWWW#...', '...#WKKKKWWW#...', '...#WWWWWWWW#...',
          '...#WKKKKKKW#...', '...#WWWWWWWW#...', '...##########...', '................'],
        mail: [
          '................', '................', '.##############.', '.#WDWWWWWWWWDW#.',
          '.#WWDWWWWWWDWW#.', '.#WWWDWWWWWDWWW#.', '.#WWWWWDWWDWWWW#.', '.#WWWWWDDWWWWW#.',
          '.#WWWWWWWWWWWW#.', '.#WWWWWWWWWWWW#', '.#WWWWWWWWWWWW#', '.#WWWWWWWWWWWW#.',
          '.#WWWWWWWWWWWW#.', '.##############.', '................', '................'],
        openmail: [
          '................', '.......##.......', '......#WW#......', '.....#WWWW#.....',
          '....#WWWWWW#....', '...#WWWWWWWW#...', '..#WWWWWWWWWW#..', '.#WWWWWWWWWWWW#.',
          '.#WWWWWWWWWWWW#.', '.#WWWWWWWWWWWW#', '.#WWWWWWWWWWWW#', '.#WWWWWWWWWWWW#.',
          '.#WWWWWWWWWWWW#', '.#WWWWWWWWWWWW#', '..############..', '................'],
        binF: [
          '....WWWWWW......', '..##WWWWWWWW##..', '..#gggggggggg#..', '..############..',
          '...#ggDggDgg#...', '...#ggDggDgg#...', '...#ggDggDgg#...', '...#ggDggDgg#...',
          '...#ggDggDgg#...', '....#gDggDg#....', '....#gDggDg#....', '....#gDggDg#....',
          '....#gDggDg#....', '....#gDggDg#....', '.....######.....', '................'],
        binE: [
          '................', '..############..', '..#gggggggggg#..', '..############..',
          '...#ggDggDgg#...', '...#ggDggDgg#...', '...#ggDggDgg#...', '...#ggDggDgg#...',
          '...#ggDggDgg#...', '....#gDggDg#....', '....#gDggDg#....', '....#gDggDg#....',
          '....#gDggDg#....', '....#gDggDg#....', '.....######.....', '................'],
        warn: [
          '.......KK.......', '......KYYK......', '.....KYYYYK.....', '....KYYKKYYK....',
          '...KYYYKKYYYK...', '..KYYYYKKYYYYK..', '..KYYYYKKYYYYK..', '.KYYYYYKKYYYYYK.',
          '.KYYYYYKKYYYYYK.', '.KYYYYYKKYYYYYK.', 'KYYYYYYKKYYYYYYK', 'KYYYYYYKKYYYYYYK',
          'KYYYYYYYYYYYYYYK', 'KYYYYYYKKYYYYYYK', 'KKKKKKKKKKKKKKKK', '................'],
        power: [
          '................', '.......##.......', '.......##.......', '.......##.......',
          '.......##.......', '.......##.......', '.......##.......', '..##........##..',
          '..#..........#..', '..#..........#..', '..#..........#..', '..##........##..',
          '....########....', '................', '................', '................'],
        hourglass: [
          '................', '..############..', '..#wwwwwwwwww#..', '...#wwyyyyww#...',
          '....#wwyyww#....', '.....#wyyw#.....', '.....#wwyw#.....', '....#wyyyw#....',
          '...#wyyyyyyw#...', '...#wyyyyyyw#...', '..#yyyyyyyyyy#..', '..#yyyyyyyyyy#..',
          '..#wwwwwwwwww#..', '..############..', '................', '................'],
        person: [
          '................', '................', '.....HHHHHH.....', '....#HHHHHH#....',
          '....#hDhhDh#....', '....#hhhhhh#....', '....#hhhhhh#....', '.....#hhhh#.....',
          '......####......', '..############..', '.#SSSSSSSSSSSS#.', '.#SSSSSSSSSSSS#.',
          '.#SSSSSSSSSSSS#.', '.#SSSSSSSSSSSS#.', '..############..', '................'],
        star: [
          '...#...', '..###..', '#######', '.#####.', '..###..', '.##.##.', '.#...#.'],
        github: [
          '................', '................', '................', '...GG......GG...',
          '...GG......GG...', '..GGGGGGGGGGGG..', '.GGGGGGGGGGGGGG.', '.GGGWWGGGGWWGGG.',
          '.GGGWWGGGGWWGGG.', '.GGGGGGGGGGGGGG.', '.GGGGGGGGGGGGGG.', '.GGGGGGGGGGGGGG.',
          '..GGGGGGGGGGGG..', '...GGGGGGGGGG...', '................', '................'],
        linkedin: [
          '................', '.BBBBBBBBBBBBBB.', '.BBBWWBBBBBBBBB.', '.BBBWWBBBBBBBBB.',
          '.BBBBBBBBBBBBBB.', '.BBBWWBBWWWWWWB.', '.BBBWWBBWWBBWWB.', '.BBBWWBBWWBBWWB.',
          '.BBBWWBBWWBBWWB.', '.BBBWWBBWWBBWWB.', '.BBBWWBBWWBBWWB.', '.BBBWWBBWWBBWWB.',
          '.BBBBBBBBBBBBBB.', '.BBBBBBBBBBBBBB.', '.BBBBBBBBBBBBBB.', '................'],
        globe: [
          '................', '....oooooooo....', '...oooggggooo...', '..oogggggooooo..',
          '.oogggggooooggg.', '.oooooooooogggg.', '.oooooooooooooo.', '.ooggggoooooooo.',
          '.oogggoooogggoo.', '.ooooooooooggggo.', '.oooooooooooooo.', '.oooogggggooooo.',
          '..ooooggggoooo..', '...oooooggggo...', '....oooooooo....', '................'],
        moon: [
          '....................', '......MMMMMMMM......', '....MMMMMMMMMMMM....', '...MMMMMMMMMMMMMM...',
          '..MMMMMMMMMMMMMMMM..', '.MMMMMMMMMMMMMMMMMM.', '.MMMMcccMMMMMMMMMMM.', '.MMMMMMMMMMMMMMMMMM.',
          '.MMMMMMMMMMMMMMccMM.', '.MMMMMMMMMMMMMMMMMM.', '.MMMMMMMMMMMcccMMMM.', '.MMMMMMMMMMMMMMMMMM.',
          '.MMMcccMMMMMMMMMMMM.', '.MMMMMMMMMMMMMmmmmm.', '.MMMMMMMMMMMMmmmmmm.', '..MMMMMMMMMMMMmmmm..',
          '...MMMMMMMMMMMmmm...', '....MMMMMMMMMMmm....', '......MMMMMMmm......', '....................']
      };
      M.app = [
        '................', '.##############.', '.#TTTTTTTTTTTT#.', '.#TTTTTTTTTTLL#.',
        '.##############.', '.#WWWWWWWWWWWW#', '.#WWGGGGGGGGWW#.', '.#WWWWWWWWWWWW#.',
        '.#WWWWWWWWWWWW#', '.#WWGGGGGGGGWW#', '.#WWWWWWWWWWWW#', '.#WWGGGGWWWWWW#.',
        '.#WWWWWWWWWWWW#', '.##############', '................', '................'];

      M.find = [
'................','....######......','..##GGGGGG##....','.##GWWWWWWG##...',
'.#GGWWWWWWGG#...','.#GWWWWWWWWG#...','.#GWWWWWWWWG#...','.#GGWWWWWWGG#...',
'.##GWWWWWWG##...','..##GGGGGG##....','....######KK....','.........KKK....',
'..........KKK...','...........KKK..','............KK..','................'];
      M.cert = [
'................','..###########...','..#WWWWWWWWW#...','..#WKKKKKKKW#...',
'..#WWWWWWWWW#...','..#WKKKKKKKW#...','..#WWWWWWWWW#...','..#WKKKKKWWW#...',
'..#WWWWWWWWW#...','..#WWWWWWWWW#...','..###########...','.......SSS......',
'......SSSSS.....','.......SSS......','......R...R.....','.....R.....R....'];
      M.journal = [
'................','..#####..#####..','.#BBBB#..#RRRR#.','.#BWWW#..#WWWR#.',
'.#BYYY#..#RYYY#.','.#BWWW#..#WWWR#.','.#BBBB#..#RRRR#.','.#BWWW#..#WWWR#.',
'.#BBBB####RRRR#.','.#BWWW#..#WWWR#.','.#BWWW#..#WWWR#.','..#BBB####RRR#..',
'...#BB####RR#...','....########....','................','................'];
      M.network = [
      '................','.######.........','.#ssss#.........','.#ssss#.........',
      '.######.........','..#WW#..........','..####..........','....##########..',
      '.............#..','.........######.','.........#ssss#.','.........#ssss#.',
      '.........######.','..........#WW#..','..........####..','................'];

      M.computer = [
        '................', '..##########....', '..#WWWWWWWW#....', '..#WssssssW#....',
        '..#WssssssW#....', '..#WssssssW#....', '..#WWWWWWWW#....', '..##########....',
        '.....####.......', '...########.....', '................', '.############...',
        '.#WWWWWWWWWW#...', '.#WkkWWWWWgW#...', '.#WWWWWWWWWW#...', '.############...'];
      M.briefcase = [
        '................', '......####......', '......#..#......', '......#..#......',
        '..############..', '..#LLLLLLLLLL#..', '..#LLLLLLLLLL#..', '..#LLL#KK#LLL#..',
        '..#LLL#KK#LLL#..', '..#LLLLLLLLLL#..', '..#LLLLLLLLLL#..', '..#LLLLLLLLLL#..',
        '..############..', '................', '................', '................'];

      /* cursors — deliberately coarser than the icons' 16x16 grid. Each pixel ships as a
         CUR_PX-wide block, so a fine grid would draw a cursor twice the size of a real one.
         These grids land at system size with the blocks still visible: arrow 14x20 css px,
         hand 18x22, i-beam 10x22, resize 22x22. The resize arrow is drawn once and rotated
         180deg so both heads match exactly. */
      const curRot180 = map => map.map(row => [...row].reverse().join('')).reverse();
      const curMerge = (a, b) => a.map((row, y) => [...row].map((ch, x) => ch === '.' ? b[y][x] : ch).join(''));
      M.curArrow = [
        'K......', 'KK.....', 'KWK....', 'KWWK...', 'KWWWK..',
        'KWWWWK.', 'KWWWKKK', 'KWKWK..', 'KK.KWK.', '...KKK.'];
      M.curHand = [
        '..KK.....', '.KWWK....', '.KWWK....', '.KWWK....',
        '.KWWKKKK.', '.KWWWWWWK', 'KKWWWWWWK', 'KWWWWWWWK',
        'KWWWWWWWK', '.KWWWWWWK', '.KKKKKKKK'];
      M.curText = [
        'WWWWW', 'WKWKW', 'WWKWW', '.WKW.', '.WKW.', '.WKW.',
        '.WKW.', '.WKW.', 'WWKWW', 'WKWKW', 'WWWWW'];
      const CUR_NW = [
        'KKKKKK.....', 'KWWWK......', 'KWWK.......', 'KWKWK......',
        'KK.KWK.....', 'K...KWK....', '...........', '...........',
        '...........', '...........', '...........'];
      M.curSize = curMerge(CUR_NW, curRot180(CUR_NW));

      const PAL = {
        txt: { '#': '#1f1f1f', 'W': '#ffffff', 'L': '#46689c' },
        folder: { '#': '#3a3000', 'Y': '#f7d54c', 'y': '#dca621', 'W': '#fdf0a8' },
        monitor: { '#': '#161616', 'B': '#c9c9c9', 's': '#0c120c', 'G': '#39e75f' },
        gear: { 'H': '#d6d6d6', 'G': '#9c9c9c' },
        pdf: { '#': '#1f1f1f', 'R': '#c00000', 'W': '#ffffff', 'K': '#333333' },
        mail: { '#': '#333333', 'W': '#fefefe', 'D': '#9a9a9a' },
        openmail: { '#': '#333333', 'W': '#fefefe', 'D': '#9a9a9a' },
        binF: { '#': '#2f2f2f', 'g': '#c4c8cc', 'D': '#7d8388', 'W': '#f4f4ee' },
        binE: { '#': '#2f2f2f', 'g': '#c4c8cc', 'D': '#7d8388', 'W': '#f4f4ee' },
        warn: { 'K': '#000000', 'Y': '#f6d21a' },
        power: { '#': '#b03000' },
        hourglass: { '#': '#000000', 'w': '#ffffff', 'y': '#c9a000' },
        cursor: { 'K': '#000000', 'W': '#ffffff' },
        starF: { '#': '#e8b820' },
        starE: { '#': '#a8a8a8' },
        github: { 'G': '#181717', 'W': '#ffffff' },
        linkedin: { 'B': '#0077b5', 'W': '#ffffff' },
        globe: { 'o': '#2a5fa8', 'g': '#3aa845' },
        moon: { 'M': '#f2ecd8', 'm': '#c9c2a4', 'c': '#a9a184' },
        briefcase: { '#': '#3f2d14', 'L': '#a9702c', 'K': '#e8c760' },
        computer: { '#': '#161616', 'W': '#c9c9c9', 's': '#0c3a5c', 'k': '#6e6e6e', 'g': '#39e75f' },
        network: { '#': '#161616', 'W': '#c9c9c9', 's': '#0c3a5c' },
        find: { '#': '#2b2b2b', 'G': '#6f9dc4', 'W': '#d8ecff', 'K': '#6b4a1e' },
        cert: { '#': '#2f2f2f', 'W': '#fdfdf5', 'K': '#8a8a8a', 'S': '#e8c760', 'R': '#c0392b' },
        journal: { '#': '#242424', 'B': '#245ea8', 'R': '#8f2e50', 'W': '#fffdf0', 'Y': '#e2bd45' }
      };

      function px(map, pal, size) {
        const w = map[0].length, h = map.length;
        let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${size}" height="${Math.round(size * h / w)}" shape-rendering="crispEdges">`;
        for (let y = 0; y < h; y++) {
          const row = map[y];
          for (let x = 0; x < w;) {
            const c = row[x];
            if (c === '.' || !pal[c]) { x++; continue; }
            let n = 1; while (x + n < w && row[x + n] === c) n++;
            s += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${pal[c]}"/>`; x += n;
          }
        }
        return s + '</svg>';
      }
      const svg = (key, size) => px(M[key], PAL[key], size);
      const appIcon = (color, size) => px(M.app, Object.assign({ '#': '#111111', 'T': color, 'L': '#ffffff', 'W': '#fdfdfd', 'G': '#8a8a8a' }), size);
      const personIcon = (t, size) => px(M.person, { '#': '#222222', 'H': t.hair, 'h': t.skin, 'S': t.shirt, 'D': '#1a1a1a' }, size);
      function starsHTML(n, size) { let s = ''; for (let i = 0; i < 5; i++)s += px(M.star, i < n ? PAL.starF : PAL.starE, size); return s; }
