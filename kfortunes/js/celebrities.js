// KStar Match Celebrity Saju Database v2
// 100 Celebrities + Avatar Color System

const Celebrities = {
  // Avatar color palette by category
  avatarColors: {
    'K-Pop':     { bg: '8B5CF6', color: 'fff' },
    'Actor':     { bg: 'EC4899', color: 'fff' },
    'Athlete':   { bg: '10B981', color: 'fff' },
    'Singer':    { bg: 'F59E0B', color: 'fff' },
    'Tech':      { bg: '3B82F6', color: 'fff' },
    'President': { bg: '6B7280', color: 'fff' },
    'Media':     { bg: 'EF4444', color: 'fff' },
    'Investor':  { bg: '14B8A6', color: 'fff' },
    'Scientist': { bg: '6366F1', color: 'fff' }
  },

  // Generate avatar URL
  getAvatarUrl(name, category, size = 200) {
    const colors = this.avatarColors[category] || { bg: '8B5CF6', color: 'fff' };
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${colors.bg}&color=${colors.color}&size=${size}&bold=true&rounded=true&font-size=0.4`;
  },

  // Get celebrity image URL with fallback
  getImageUrl(celebrity) {
    if (celebrity.image) {
      return `/images/celebrities/${celebrity.image}`;
    }
    // Fallback to avatar
    return this.getAvatarUrl(celebrity.name, celebrity.category);
  },

  // Load celebrity image with error handling
  loadCelebrityImage(celebrity, onSuccess, onError) {
    const imageUrl = this.getImageUrl(celebrity);

    // If it's an avatar URL, just return it
    if (imageUrl.includes('ui-avatars.com')) {
      if (onSuccess) onSuccess(imageUrl);
      return;
    }

    // Try to preload the actual image
    const img = new Image();
    img.onload = () => {
      if (onSuccess) onSuccess(imageUrl);
    };
    img.onerror = () => {
      // Fallback to avatar on error
      const fallbackUrl = this.getAvatarUrl(celebrity.name, celebrity.category);
      if (onError) onError(fallbackUrl);
      else if (onSuccess) onSuccess(fallbackUrl);
    };
    img.src = imageUrl;
  },

  // 100 Celebrity Database
  data: [
    // ============================================
    // WOOD Day Masters
    // ============================================
    // 甲 (Yang Wood)
    { name: "BTS Jungkook", korean: "정국", initials: "JK", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1997, category: "K-Pop", popularity: 100, image: "kpop/bts-jungkook.webp" },
    { name: "Stray Kids Bang Chan", korean: "방찬", initials: "BC", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1997, category: "K-Pop", popularity: 92, image: "kpop/stray-kids-bang-chan.webp" },
    { name: "ENHYPEN Heeseung", korean: "희승", initials: "HS", dayMaster: "wood", yin: false, stem: "甲", birthYear: 2001, category: "K-Pop", popularity: 88, image: "kpop/enhypen-heeseung.webp" },
    { name: "NCT Taeyong", korean: "태용", initials: "TY", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1995, category: "K-Pop", popularity: 90, image: "kpop/nct-taeyong.webp" },
    { name: "Leonardo DiCaprio", korean: "레오나르도 디카프리오", initials: "LD", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1974, category: "Actor", popularity: 95, image: "actors/leonardo-dicaprio.webp" },
    { name: "Cristiano Ronaldo", korean: "크리스티아누 호날두", initials: "CR", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1985, category: "Athlete", popularity: 98, image: "athletes/cristiano-ronaldo.webp" },
    { name: "Gong Yoo", korean: "공유", initials: "GY", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1979, category: "Actor", popularity: 93, image: "actors/gong-yoo.webp" },
    { name: "Ed Sheeran", korean: "에드 시런", initials: "ES", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1991, category: "Singer", popularity: 88, image: "artists/ed-sheeran.webp" },
    { name: "Mark Zuckerberg", korean: "마크 저커버그", initials: "MZ", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1984, category: "Tech", popularity: 85, image: "business/mark-zuckerberg.webp" },
    { name: "Barack Obama", korean: "버락 오바마", initials: "BO", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1961, category: "President", popularity: 90, image: "politicians/barack-obama.webp" },

    // 乙 (Yin Wood)
    { name: "IU", korean: "아이유", initials: "IU", dayMaster: "wood", yin: true, stem: "乙", birthYear: 1993, category: "K-Pop", popularity: 99, image: "kpop/iu.webp" },
    { name: "aespa Karina", korean: "카리나", initials: "KR", dayMaster: "wood", yin: true, stem: "乙", birthYear: 2000, category: "K-Pop", popularity: 96, image: "kpop/aespa-karina.webp" },
    { name: "TWICE Nayeon", korean: "나연", initials: "NY", dayMaster: "wood", yin: true, stem: "乙", birthYear: 1995, category: "K-Pop", popularity: 95, image: "kpop/twice-nayeon.webp" },
    { name: "TWICE Momo", korean: "모모", initials: "MM", dayMaster: "wood", yin: true, stem: "乙", birthYear: 1996, category: "K-Pop", popularity: 91, image: "kpop/twice-momo.webp" },
    { name: "(G)I-DLE Miyeon", korean: "미연", initials: "MY", dayMaster: "wood", yin: true, stem: "乙", birthYear: 1997, category: "K-Pop", popularity: 87, image: "kpop/gidle-miyeon.webp" },
    { name: "Taylor Swift", korean: "테일러 스위프트", initials: "TS", dayMaster: "wood", yin: true, stem: "乙", birthYear: 1989, category: "Singer", popularity: 100, image: "artists/taylor-swift.webp" },
    { name: "Ariana Grande", korean: "아리아나 그란데", initials: "AG", dayMaster: "wood", yin: true, stem: "乙", birthYear: 1993, category: "Singer", popularity: 95, image: "artists/ariana-grande.webp" },
    { name: "Zendaya", korean: "젠데이아", initials: "ZD", dayMaster: "wood", yin: true, stem: "乙", birthYear: 1996, category: "Actor", popularity: 92, image: "actors/zendaya.webp" },
    { name: "Song Hye-kyo", korean: "송혜교", initials: "SH", dayMaster: "wood", yin: true, stem: "乙", birthYear: 1981, category: "Actor", popularity: 94, image: "actors/song-hye-kyo.webp" },
    { name: "Naomi Osaka", korean: "오사카 나오미", initials: "NO", dayMaster: "wood", yin: true, stem: "乙", birthYear: 1997, category: "Athlete", popularity: 85, image: "athletes/naomi-osaka.webp" },

    // ============================================
    // FIRE Day Masters
    // ============================================
    // 丙 (Yang Fire)
    { name: "BTS V", korean: "뷔", initials: "V", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1995, category: "K-Pop", popularity: 99, image: "kpop/bts-v.webp" },
    { name: "SEVENTEEN Hoshi", korean: "호시", initials: "HS", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1996, category: "K-Pop", popularity: 89, image: "kpop/seventeen-hoshi.webp" },
    { name: "TXT Yeonjun", korean: "연준", initials: "YJ", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1999, category: "K-Pop", popularity: 91, image: "kpop/txt-yeonjun.webp" },
    { name: "ATEEZ Hongjoong", korean: "홍중", initials: "HJ", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1998, category: "K-Pop", popularity: 88, image: "kpop/ateez-hongjoong.webp" },
    { name: "Park Seo-joon", korean: "박서준", initials: "SJ", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1988, category: "Actor", popularity: 93, image: "actors/park-seo-joon.webp" },
    { name: "Tom Holland", korean: "톰 홀랜드", initials: "TH", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1996, category: "Actor", popularity: 91, image: "actors/tom-holland.webp" },
    { name: "Drake", korean: "드레이크", initials: "DK", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1986, category: "Singer", popularity: 92, image: "artists/drake.webp" },
    { name: "LeBron James", korean: "르브론 제임스", initials: "LJ", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1984, category: "Athlete", popularity: 95, image: "athletes/lebron-james.webp" },
    { name: "Steve Jobs", korean: "스티브 잡스", initials: "SJ", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1955, category: "Tech", popularity: 90, image: "business/steve-jobs.webp" },
    { name: "Donald Trump", korean: "도널드 트럼프", initials: "DT", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1946, category: "President", popularity: 85, image: "politicians/donald-trump.webp" },

    // 丁 (Yin Fire)
    { name: "BLACKPINK Jennie", korean: "제니", initials: "JN", dayMaster: "fire", yin: true, stem: "丁", birthYear: 1996, category: "K-Pop", popularity: 98, image: "kpop/blackpink-jennie.webp" },
    { name: "LE SSERAFIM Kazuha", korean: "카즈하", initials: "KZ", dayMaster: "fire", yin: true, stem: "丁", birthYear: 2003, category: "K-Pop", popularity: 90, image: "kpop/le-sserafim-kazuha.webp" },
    { name: "IVE Wonyoung", korean: "장원영", initials: "WY", dayMaster: "fire", yin: true, stem: "丁", birthYear: 2004, category: "K-Pop", popularity: 97, image: "kpop/ive-wonyoung.webp" },
    { name: "NMIXX Sullyoon", korean: "설윤", initials: "SY", dayMaster: "fire", yin: true, stem: "丁", birthYear: 2004, category: "K-Pop", popularity: 86, image: "kpop/nmixx-sullyoon.webp" },
    { name: "Beyonce", korean: "비욘세", initials: "BY", dayMaster: "fire", yin: true, stem: "丁", birthYear: 1981, category: "Singer", popularity: 97, image: "artists/beyonce.webp" },
    { name: "Billie Eilish", korean: "빌리 아일리시", initials: "BE", dayMaster: "fire", yin: true, stem: "丁", birthYear: 2001, category: "Singer", popularity: 93, image: "artists/billie-eilish.webp" },
    { name: "Emma Watson", korean: "엠마 왓슨", initials: "EW", dayMaster: "fire", yin: true, stem: "丁", birthYear: 1990, category: "Actor", popularity: 89, image: "actors/emma-watson.webp" },
    { name: "Han So-hee", korean: "한소희", initials: "SH", dayMaster: "fire", yin: true, stem: "丁", birthYear: 1994, category: "Actor", popularity: 92, image: "actors/han-so-hee.webp" },
    { name: "Serena Williams", korean: "세레나 윌리엄스", initials: "SW", dayMaster: "fire", yin: true, stem: "丁", birthYear: 1981, category: "Athlete", popularity: 88, image: "athletes/serena-williams.webp" },
    { name: "Jeon Jong-seo", korean: "전종서", initials: "JS", dayMaster: "fire", yin: true, stem: "丁", birthYear: 1994, category: "Actor", popularity: 84, image: "actors/jeon-jong-seo.webp" },

    // ============================================
    // EARTH Day Masters
    // ============================================
    // 戊 (Yang Earth)
    { name: "BTS RM", korean: "RM", initials: "RM", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1994, category: "K-Pop", popularity: 96, image: "kpop/bts-rm.webp" },
    { name: "EXO Baekhyun", korean: "백현", initials: "BH", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1992, category: "K-Pop", popularity: 94, image: "kpop/exo-baekhyun.webp" },
    { name: "SHINee Minho", korean: "민호", initials: "MH", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1991, category: "K-Pop", popularity: 88, image: "kpop/shinee-minho.webp" },
    { name: "2PM Junho", korean: "준호", initials: "JH", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1990, category: "K-Pop", popularity: 86, image: "kpop/2pm-junho.webp" },
    { name: "Lee Min-ho", korean: "이민호", initials: "MH", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1987, category: "Actor", popularity: 95, image: "actors/lee-min-ho.webp" },
    { name: "Timothee Chalamet", korean: "티모시 샬라메", initials: "TC", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1995, category: "Actor", popularity: 91, image: "actors/timothee-chalamet.webp" },
    { name: "Bruno Mars", korean: "브루노 마스", initials: "BM", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1985, category: "Singer", popularity: 93, image: "artists/bruno-mars.webp" },
    { name: "The Weeknd", korean: "더 위켄드", initials: "WK", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1990, category: "Singer", popularity: 92, image: "artists/the-weeknd.webp" },
    { name: "Elon Musk", korean: "일론 머스크", initials: "EM", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1971, category: "Tech", popularity: 95, image: "business/elon-musk.webp" },
    { name: "Joe Biden", korean: "조 바이든", initials: "JB", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1942, category: "President", popularity: 82, image: "politicians/joe-biden.webp" },

    // 己 (Yin Earth)
    { name: "BLACKPINK Rose", korean: "로제", initials: "RS", dayMaster: "earth", yin: true, stem: "己", birthYear: 1997, category: "K-Pop", popularity: 97, image: "kpop/blackpink-rose.webp" },
    { name: "aespa Winter", korean: "윈터", initials: "WT", dayMaster: "earth", yin: true, stem: "己", birthYear: 2001, category: "K-Pop", popularity: 93, image: "kpop/aespa-winter.webp" },
    { name: "Red Velvet Irene", korean: "아이린", initials: "IR", dayMaster: "earth", yin: true, stem: "己", birthYear: 1991, category: "K-Pop", popularity: 92, image: "kpop/red-velvet-irene.webp" },
    { name: "Oh My Girl YooA", korean: "유아", initials: "YA", dayMaster: "earth", yin: true, stem: "己", birthYear: 1995, category: "K-Pop", popularity: 85, image: "kpop/oh-my-girl-yooa.webp" },
    { name: "Son Heung-min", korean: "손흥민", initials: "SH", dayMaster: "earth", yin: true, stem: "己", birthYear: 1992, category: "Athlete", popularity: 96, image: "athletes/son-heung-min.webp" },
    { name: "Kim Yuna", korean: "김연아", initials: "YK", dayMaster: "earth", yin: true, stem: "己", birthYear: 1990, category: "Athlete", popularity: 94, image: "athletes/kim-yuna.webp" },
    { name: "Dua Lipa", korean: "두아 리파", initials: "DL", dayMaster: "earth", yin: true, stem: "己", birthYear: 1995, category: "Singer", popularity: 91, image: "artists/dua-lipa.webp" },
    { name: "Jennifer Lawrence", korean: "제니퍼 로렌스", initials: "JL", dayMaster: "earth", yin: true, stem: "己", birthYear: 1990, category: "Actor", popularity: 89, image: "actors/jennifer-lawrence.webp" },
    { name: "Kim Tae-ri", korean: "김태리", initials: "TR", dayMaster: "earth", yin: true, stem: "己", birthYear: 1990, category: "Actor", popularity: 91, image: "actors/kim-tae-ri.webp" },
    { name: "Oprah Winfrey", korean: "오프라 윈프리", initials: "OW", dayMaster: "earth", yin: true, stem: "己", birthYear: 1954, category: "Media", popularity: 88, image: "business/oprah-winfrey.webp" },

    // ============================================
    // METAL Day Masters
    // ============================================
    // 庚 (Yang Metal)
    { name: "BTS Suga", korean: "슈가", initials: "SG", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1993, category: "K-Pop", popularity: 97, image: "kpop/bts-suga.webp" },
    { name: "Stray Kids Hyunjin", korean: "현진", initials: "HJ", dayMaster: "metal", yin: false, stem: "庚", birthYear: 2000, category: "K-Pop", popularity: 94, image: "kpop/stray-kids-hyunjin.webp" },
    { name: "NCT Mark", korean: "마크", initials: "MK", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1999, category: "K-Pop", popularity: 91, image: "kpop/nct-mark.webp" },
    { name: "TREASURE Hyunsuk", korean: "현석", initials: "HS", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1999, category: "K-Pop", popularity: 84, image: "kpop/treasure-hyunsuk.webp" },
    { name: "Hyun Bin", korean: "현빈", initials: "HB", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1982, category: "Actor", popularity: 94, image: "actors/hyun-bin.webp" },
    { name: "Chris Hemsworth", korean: "크리스 헴스워스", initials: "CH", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1983, category: "Actor", popularity: 90, image: "actors/chris-hemsworth.webp" },
    { name: "Justin Bieber", korean: "저스틴 비버", initials: "JB", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1994, category: "Singer", popularity: 91, image: "artists/justin-bieber.webp" },
    { name: "Lionel Messi", korean: "리오넬 메시", initials: "LM", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1987, category: "Athlete", popularity: 98, image: "athletes/lionel-messi.webp" },
    { name: "Roger Federer", korean: "로저 페더러", initials: "RF", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1981, category: "Athlete", popularity: 87, image: "athletes/roger-federer.webp" },
    { name: "Bill Gates", korean: "빌 게이츠", initials: "BG", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1955, category: "Tech", popularity: 88, image: "business/bill-gates.webp" },

    // 辛 (Yin Metal)
    { name: "NewJeans Minji", korean: "민지", initials: "MJ", dayMaster: "metal", yin: true, stem: "辛", birthYear: 2004, category: "K-Pop", popularity: 96, image: "kpop/newjeans-minji.webp" },
    { name: "LE SSERAFIM Chaewon", korean: "채원", initials: "CW", dayMaster: "metal", yin: true, stem: "辛", birthYear: 2000, category: "K-Pop", popularity: 93, image: "kpop/le-sserafim-chaewon.webp" },
    { name: "ITZY Yeji", korean: "예지", initials: "YJ", dayMaster: "metal", yin: true, stem: "辛", birthYear: 2000, category: "K-Pop", popularity: 91, image: "kpop/itzy-yeji.webp" },
    { name: "Kep1er Xiaoting", korean: "샤오팅", initials: "XT", dayMaster: "metal", yin: true, stem: "辛", birthYear: 1999, category: "K-Pop", popularity: 85, image: "kpop/kep1er-xiaoting.webp" },
    { name: "STAYC Sieun", korean: "시은", initials: "SE", dayMaster: "metal", yin: true, stem: "辛", birthYear: 2001, category: "K-Pop", popularity: 84, image: "kpop/stayc-sieun.webp" },
    { name: "Lady Gaga", korean: "레이디 가가", initials: "LG", dayMaster: "metal", yin: true, stem: "辛", birthYear: 1986, category: "Singer", popularity: 92, image: "artists/lady-gaga.webp" },
    { name: "Adele", korean: "아델", initials: "AD", dayMaster: "metal", yin: true, stem: "辛", birthYear: 1988, category: "Singer", popularity: 91, image: "artists/adele.webp" },
    { name: "Margot Robbie", korean: "마고 로비", initials: "MR", dayMaster: "metal", yin: true, stem: "辛", birthYear: 1990, category: "Actor", popularity: 89, image: "actors/margot-robbie.webp" },
    { name: "Son Ye-jin", korean: "손예진", initials: "YJ", dayMaster: "metal", yin: true, stem: "辛", birthYear: 1982, category: "Actor", popularity: 93, image: "actors/son-ye-jin.webp" },
    { name: "Park Shin-hye", korean: "박신혜", initials: "SH", dayMaster: "metal", yin: true, stem: "辛", birthYear: 1990, category: "Actor", popularity: 90, image: "actors/park-shin-hye.webp" },

    // ============================================
    // WATER Day Masters
    // ============================================
    // 壬 (Yang Water)
    { name: "BTS Jin", korean: "진", initials: "JN", dayMaster: "water", yin: false, stem: "壬", birthYear: 1992, category: "K-Pop", popularity: 95, image: "kpop/bts-jin.webp" },
    { name: "BTS J-Hope", korean: "제이홉", initials: "JH", dayMaster: "water", yin: false, stem: "壬", birthYear: 1994, category: "K-Pop", popularity: 94, image: "kpop/bts-jhope.webp" },
    { name: "BTS Jimin", korean: "지민", initials: "JM", dayMaster: "water", yin: false, stem: "壬", birthYear: 1995, category: "K-Pop", popularity: 98, image: "kpop/bts-jimin.webp" },
    { name: "EXO Kai", korean: "카이", initials: "KI", dayMaster: "water", yin: false, stem: "壬", birthYear: 1994, category: "K-Pop", popularity: 92, image: "kpop/exo-kai.webp" },
    { name: "ASTRO Cha Eun-woo", korean: "차은우", initials: "EW", dayMaster: "water", yin: false, stem: "壬", birthYear: 1997, category: "K-Pop", popularity: 95, image: "kpop/astro-cha-eun-woo.webp" },
    { name: "Park Bo-gum", korean: "박보검", initials: "BG", dayMaster: "water", yin: false, stem: "壬", birthYear: 1993, category: "Actor", popularity: 93, image: "actors/park-bo-gum.webp" },
    { name: "Robert Downey Jr.", korean: "로버트 다우니 주니어", initials: "RD", dayMaster: "water", yin: false, stem: "壬", birthYear: 1965, category: "Actor", popularity: 91, image: "actors/robert-downey-jr.webp" },
    { name: "Harry Styles", korean: "해리 스타일스", initials: "HS", dayMaster: "water", yin: false, stem: "壬", birthYear: 1994, category: "Singer", popularity: 93, image: "artists/harry-styles.webp" },
    { name: "Post Malone", korean: "포스트 말론", initials: "PM", dayMaster: "water", yin: false, stem: "壬", birthYear: 1995, category: "Singer", popularity: 88, image: "artists/post-malone.webp" },
    { name: "Michael Jordan", korean: "마이클 조던", initials: "MJ", dayMaster: "water", yin: false, stem: "壬", birthYear: 1963, category: "Athlete", popularity: 92, image: "athletes/michael-jordan.webp" },

    // 癸 (Yin Water)
    { name: "BLACKPINK Lisa", korean: "리사", initials: "LS", dayMaster: "water", yin: true, stem: "癸", birthYear: 1997, category: "K-Pop", popularity: 98, image: "kpop/blackpink-lisa.webp" },
    { name: "NewJeans Hanni", korean: "하니", initials: "HN", dayMaster: "water", yin: true, stem: "癸", birthYear: 2004, category: "K-Pop", popularity: 95, image: "kpop/newjeans-hanni.webp" },
    { name: "IVE Yujin", korean: "안유진", initials: "YJ", dayMaster: "water", yin: true, stem: "癸", birthYear: 2003, category: "K-Pop", popularity: 94, image: "kpop/ive-yujin.webp" },
    { name: "NewJeans Haerin", korean: "해린", initials: "HR", dayMaster: "water", yin: true, stem: "癸", birthYear: 2006, category: "K-Pop", popularity: 93, image: "kpop/newjeans-haerin.webp" },
    { name: "NewJeans Danielle", korean: "다니엘", initials: "DN", dayMaster: "water", yin: true, stem: "癸", birthYear: 2005, category: "K-Pop", popularity: 92, image: "kpop/newjeans-danielle.webp" },
    { name: "Rihanna", korean: "리한나", initials: "RH", dayMaster: "water", yin: true, stem: "癸", birthYear: 1988, category: "Singer", popularity: 94, image: "artists/rihanna.webp" },
    { name: "Selena Gomez", korean: "셀레나 고메즈", initials: "SG", dayMaster: "water", yin: true, stem: "癸", birthYear: 1992, category: "Singer", popularity: 91, image: "artists/selena-gomez.webp" },
    { name: "Scarlett Johansson", korean: "스칼렛 요한슨", initials: "SJ", dayMaster: "water", yin: true, stem: "癸", birthYear: 1984, category: "Actor", popularity: 90, image: "actors/scarlett-johansson.webp" },
    { name: "Suzy", korean: "수지", initials: "SZ", dayMaster: "water", yin: true, stem: "癸", birthYear: 1994, category: "Actor", popularity: 94, image: "actors/suzy.webp" },
    { name: "Simone Biles", korean: "시몬 바일스", initials: "SB", dayMaster: "water", yin: true, stem: "癸", birthYear: 1997, category: "Athlete", popularity: 87, image: "athletes/simone-biles.webp" },
  ],

  // 천간 정보
  stems: {
    '甲': { element: 'wood', yin: false, korean: '갑', english: 'Yang Wood' },
    '乙': { element: 'wood', yin: true, korean: '을', english: 'Yin Wood' },
    '丙': { element: 'fire', yin: false, korean: '병', english: 'Yang Fire' },
    '丁': { element: 'fire', yin: true, korean: '정', english: 'Yin Fire' },
    '戊': { element: 'earth', yin: false, korean: '무', english: 'Yang Earth' },
    '己': { element: 'earth', yin: true, korean: '기', english: 'Yin Earth' },
    '庚': { element: 'metal', yin: false, korean: '경', english: 'Yang Metal' },
    '辛': { element: 'metal', yin: true, korean: '신', english: 'Yin Metal' },
    '壬': { element: 'water', yin: false, korean: '임', english: 'Yang Water' },
    '癸': { element: 'water', yin: true, korean: '계', english: 'Yin Water' }
  },

  // 정확한 일간 매칭 (음양 구분)
  findMatches(dayMaster) {
    const element = dayMaster.element;
    const isYin = dayMaster.yin;
    const stem = dayMaster.hanja; // 천간 한자 (甲乙丙丁戊己庚辛壬癸)

    // 1순위: 정확히 같은 천간 (甲=甲, 乙=乙, etc.)
    const exactStemMatches = this.data.filter(c => c.stem === stem);

    // 2순위: 같은 오행 + 같은 음양
    const sameYinYang = this.data.filter(c =>
      c.dayMaster === element && c.yin === isYin && c.stem !== stem
    );

    // 3순위: 같은 오행 + 다른 음양
    const differentYinYang = this.data.filter(c =>
      c.dayMaster === element && c.yin !== isYin
    );

    return {
      exact: exactStemMatches,      // 완전 일치
      similar: sameYinYang,         // 같은 음양
      related: differentYinYang     // 같은 오행
    };
  },

  // 우선순위 기반 랜덤 매치 선택
  getRandomMatch(dayMaster, count = 2) {
    const matches = this.findMatches(dayMaster);

    // 우선순위: exact > similar > related
    let pool = [];

    if (matches.exact.length >= count) {
      pool = matches.exact;
    } else if (matches.exact.length + matches.similar.length >= count) {
      pool = [...matches.exact, ...matches.similar];
    } else {
      pool = [...matches.exact, ...matches.similar, ...matches.related];
    }

    // 셔플 후 선택
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  // 매치 타입 반환 (UI에서 표시용)
  getMatchType(celebrity, dayMaster) {
    if (celebrity.stem === dayMaster.hanja) {
      return { type: 'exact', label: 'Perfect Match', emoji: '🎯' };
    } else if (celebrity.yin === dayMaster.yin) {
      return { type: 'similar', label: 'Same Energy', emoji: '✨' };
    } else {
      return { type: 'related', label: 'Same Element', emoji: '🔮' };
    }
  },

  // 개선된 매치 메시지 생성
  getMatchMessage(celebrity, dayMaster) {
    const element = dayMaster.element;
    const stemInfo = this.stems[dayMaster.hanja];
    const matchType = this.getMatchType(celebrity, dayMaster);

    const elementNames = {
      wood: { ko: '목(木)', en: 'Wood' },
      fire: { ko: '화(火)', en: 'Fire' },
      earth: { ko: '토(土)', en: 'Earth' },
      metal: { ko: '금(金)', en: 'Metal' },
      water: { ko: '수(水)', en: 'Water' }
    };

    const yinYangEn = dayMaster.yin ? 'Yin' : 'Yang';

    if (matchType.type === 'exact') {
      return `${matchType.emoji} You share the exact same Day Master: ${yinYangEn} ${elementNames[element].en}!`;
    } else if (matchType.type === 'similar') {
      return `${matchType.emoji} Both of you have ${yinYangEn} ${elementNames[element].en} energy!`;
    } else {
      return `🔮 You share the ${elementNames[element].en} elemental energy!`;
    }
  },

  // 🔮 연예인 궁합 계산 (프리미엄 기능)
  calculateCelebrityCompatibility(userDayMaster, celebrity) {
    const matchType = this.getMatchType(celebrity, userDayMaster);
    const userElement = userDayMaster.element;
    const celebElement = celebrity.dayMaster;

    // 기본 점수 계산
    let baseScore = 50;

    // 매치 타입에 따른 점수
    if (matchType.type === 'exact') {
      baseScore = 85 + Math.floor(Math.random() * 10); // 85-94%
    } else if (matchType.type === 'similar') {
      baseScore = 70 + Math.floor(Math.random() * 15); // 70-84%
    } else {
      baseScore = 55 + Math.floor(Math.random() * 15); // 55-69%
    }

    // 오행 상생/상극 관계
    const elementRelations = {
      wood: { generates: 'fire', controls: 'earth', generatedBy: 'water', controlledBy: 'metal' },
      fire: { generates: 'earth', controls: 'metal', generatedBy: 'wood', controlledBy: 'water' },
      earth: { generates: 'metal', controls: 'water', generatedBy: 'fire', controlledBy: 'wood' },
      metal: { generates: 'water', controls: 'wood', generatedBy: 'earth', controlledBy: 'fire' },
      water: { generates: 'wood', controls: 'fire', generatedBy: 'metal', controlledBy: 'earth' }
    };

    const relation = elementRelations[userElement];
    let relationBonus = 0;
    let relationDesc = '';

    if (celebElement === relation.generates) {
      relationBonus = 8;
      relationDesc = 'You naturally support and nurture their energy';
    } else if (celebElement === relation.generatedBy) {
      relationBonus = 10;
      relationDesc = 'They bring out the best in you';
    } else if (celebElement === relation.controls) {
      relationBonus = -5;
      relationDesc = 'Dynamic tension creates exciting chemistry';
    } else if (celebElement === relation.controlledBy) {
      relationBonus = -3;
      relationDesc = 'They challenge you to grow';
    } else {
      relationBonus = 5;
      relationDesc = 'Natural harmony and understanding';
    }

    const totalScore = Math.min(98, Math.max(45, baseScore + relationBonus));

    // 세부 점수 계산
    const personality = totalScore + Math.floor(Math.random() * 10) - 5;
    const emotional = totalScore + Math.floor(Math.random() * 12) - 6;
    const longTerm = totalScore + Math.floor(Math.random() * 8) - 4;

    // 프리미엄 분석 내용
    const premiumAnalysis = this.generatePremiumAnalysis(userDayMaster, celebrity, totalScore);

    return {
      overall: Math.min(98, Math.max(40, totalScore)),
      personality: Math.min(98, Math.max(35, personality)),
      emotional: Math.min(98, Math.max(35, emotional)),
      longTerm: Math.min(98, Math.max(35, longTerm)),
      relationDesc: relationDesc,
      matchType: matchType,
      premiumAnalysis: premiumAnalysis
    };
  },

  // 프리미엄 분석 생성
  generatePremiumAnalysis(userDayMaster, celebrity, score) {
    const celebName = celebrity.name;
    const userYinYang = userDayMaster.yin ? 'Yin' : 'Yang';
    const celebYinYang = celebrity.yin ? 'Yin' : 'Yang';

    const elementTraits = {
      wood: { trait: 'growth-oriented', strength: 'creativity', challenge: 'flexibility' },
      fire: { trait: 'passionate', strength: 'charisma', challenge: 'patience' },
      earth: { trait: 'stable', strength: 'reliability', challenge: 'spontaneity' },
      metal: { trait: 'principled', strength: 'determination', challenge: 'adaptability' },
      water: { trait: 'intuitive', strength: 'wisdom', challenge: 'boundaries' }
    };

    const userTraits = elementTraits[userDayMaster.element];
    const celebTraits = elementTraits[celebrity.dayMaster];

    return {
      intro: `Your connection with ${celebName} is marked by ${score > 80 ? 'exceptional' : score > 65 ? 'strong' : 'interesting'} cosmic alignment.`,
      strengths: [
        `Both share ${userYinYang === celebYinYang ? 'similar' : 'complementary'} energy patterns`,
        `Your ${userTraits.strength} meets their ${celebTraits.strength}`,
        `Potential for ${score > 75 ? 'deep understanding' : 'growth together'}`
      ],
      challenges: [
        `Balance ${userTraits.challenge} with their ${celebTraits.challenge}`,
        `Navigate different ${userYinYang === celebYinYang ? 'expression styles' : 'energy levels'}`
      ],
      advice: score > 80
        ? `A highly favorable cosmic connection! You would naturally understand each other's rhythms.`
        : score > 65
        ? `A promising match with room for beautiful growth and mutual inspiration.`
        : `An intriguing connection that offers unique lessons and unexpected chemistry.`,
      luckyDate: this.generateLuckyDate(userDayMaster.element, celebrity.dayMaster)
    };
  },

  // 행운의 만남 날짜 생성
  generateLuckyDate(userElement, celebElement) {
    const luckyDays = {
      wood: ['Monday', 'Thursday'],
      fire: ['Tuesday', 'Sunday'],
      earth: ['Saturday', 'Wednesday'],
      metal: ['Friday', 'Monday'],
      water: ['Wednesday', 'Thursday']
    };
    const day = luckyDays[userElement][Math.floor(Math.random() * 2)];
    const month = ['March', 'April', 'May', 'June', 'July', 'August'][Math.floor(Math.random() * 6)];
    return `${day}s in ${month} 2026`;
  },

  // ============================================
  // 🌟 K-Star Saju Twin Feature (바이럴 핵심 기능)
  // ============================================

  // 매칭 가중치 (PRD 기준)
  MATCHING_WEIGHTS: {
    dayMaster: 40,      // 일간 (가장 중요: 본질적 성격)
    sameElement: 20,    // 같은 오행 (일간 다를 때)
    yearBranch: 15,     // 띠 (12지지)
    popularity: 10      // 인기도 보너스
  },

  // 매칭 등급
  MATCH_GRADES: {
    DESTINY_TWIN: { min: 85, label: '운명적 쌍둥이', labelEn: 'Destiny Twin', stars: 5, emoji: '🌟' },
    SOUL_MATE: { min: 70, label: '영혼의 짝', labelEn: 'Soul Match', stars: 4, emoji: '✨' },
    SAME_ENERGY: { min: 55, label: '같은 기운', labelEn: 'Same Energy', stars: 3, emoji: '💫' },
    SIMILAR: { min: 40, label: '비슷한 에너지', labelEn: 'Similar Vibe', stars: 2, emoji: '🔮' },
    DIFFERENT: { min: 0, label: '다른 길', labelEn: 'Different Path', stars: 1, emoji: '🌙' }
  },

  // 12지지 (띠) 매핑
  yearBranches: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'],

  // 출생년도에서 띠 계산
  getYearBranch(year) {
    const baseYear = 1900; // 1900년은 쥐띠
    const index = (year - baseYear) % 12;
    return this.yearBranches[index >= 0 ? index : index + 12];
  },

  // K-Star Twin 매칭 점수 계산
  calculateTwinScore(userSaju, celebrity) {
    let score = 0;
    const details = [];

    const userDayMaster = userSaju.dayMaster;
    const celebStem = celebrity.stem;
    const userElement = userDayMaster.element;
    const celebElement = celebrity.dayMaster;

    // 1. 일간 매칭 (40점)
    if (userDayMaster.hanja === celebStem) {
      score += 40;
      details.push({ type: 'dayMaster', points: 40, message: `Same Day Master: ${celebStem}` });
    } else if (userElement === celebElement) {
      score += 20;
      details.push({ type: 'element', points: 20, message: `Same Element: ${celebElement}` });
    }

    // 2. 띠 매칭 (15점)
    const userYear = userSaju.birthYear || new Date().getFullYear() - 25; // fallback
    const celebYear = celebrity.birthYear;
    const userBranch = this.getYearBranch(userYear);
    const celebBranch = this.getYearBranch(celebYear);

    if (userBranch === celebBranch) {
      score += 15;
      details.push({ type: 'yearBranch', points: 15, message: `Same Zodiac: ${userBranch}` });
    } else if (this.isTriangleMatch(userBranch, celebBranch)) {
      score += 8;
      details.push({ type: 'triangle', points: 8, message: `Zodiac Harmony` });
    }

    // 3. 음양 조화 (10점)
    if (userDayMaster.yin === celebrity.yin) {
      score += 10;
      details.push({ type: 'yinyang', points: 10, message: userDayMaster.yin ? 'Both Yin Energy' : 'Both Yang Energy' });
    }

    // 4. 인기도 보너스 (최대 5점)
    const popularityBonus = Math.floor((celebrity.popularity || 80) / 20);
    score += popularityBonus;

    // 점수 보정 (최소 25, 최대 98)
    score = Math.max(25, Math.min(98, score + Math.floor(Math.random() * 10)));

    return {
      score,
      details,
      grade: this.getMatchGrade(score)
    };
  },

  // 삼합 (Triangle Harmony) 체크
  isTriangleMatch(branch1, branch2) {
    const triangles = [
      ['Rat', 'Dragon', 'Monkey'],      // 수삼합
      ['Ox', 'Snake', 'Rooster'],       // 금삼합
      ['Tiger', 'Horse', 'Dog'],        // 화삼합
      ['Rabbit', 'Goat', 'Pig']         // 목삼합
    ];
    return triangles.some(group => group.includes(branch1) && group.includes(branch2));
  },

  // 매칭 등급 결정
  getMatchGrade(score) {
    if (score >= this.MATCH_GRADES.DESTINY_TWIN.min) return this.MATCH_GRADES.DESTINY_TWIN;
    if (score >= this.MATCH_GRADES.SOUL_MATE.min) return this.MATCH_GRADES.SOUL_MATE;
    if (score >= this.MATCH_GRADES.SAME_ENERGY.min) return this.MATCH_GRADES.SAME_ENERGY;
    if (score >= this.MATCH_GRADES.SIMILAR.min) return this.MATCH_GRADES.SIMILAR;
    return this.MATCH_GRADES.DIFFERENT;
  },

  // K-Star 카테고리 (한국 연예인 우선)
  kstarCategories: ['K-Pop', 'Actor', 'Athlete'],

  // Check if celebrity is a Korean star
  isKoreanStar(celebrity) {
    const koreanCategories = ['K-Pop'];
    const koreanActors = ['공유', '송혜교', '박서준', '이민호', '현빈', '손예진', '김태리', '한소희', '수지', '박보검', '차은우', '박신혜', '전종서'];
    const koreanAthletes = ['손흥민', '김연아'];

    if (koreanCategories.includes(celebrity.category)) return true;
    if (koreanActors.includes(celebrity.korean)) return true;
    if (koreanAthletes.includes(celebrity.korean)) return true;
    return false;
  },

  // 최고의 K-Star Twin 찾기 (한국 연예인 우선)
  findBestTwin(userSaju, count = 3) {
    const allMatches = this.data.map(celeb => ({
      celebrity: celeb,
      ...this.calculateTwinScore(userSaju, celeb),
      isKorean: this.isKoreanStar(celeb)
    }));

    // 한국 연예인 우선, 그 다음 점수순 정렬
    return allMatches
      .sort((a, b) => {
        // 한국 연예인 우선
        if (a.isKorean && !b.isKorean) return -1;
        if (!a.isKorean && b.isKorean) return 1;
        // 같은 국적이면 점수순
        return b.score - a.score;
      })
      .slice(0, count);
  },

  // 일간별 매칭 메시지
  getTwinMessage(dayMasterHanja, score) {
    const messages = {
      '甲': {
        high: "You're both natural leaders with strong Yang Wood energy! Like a tall tree, you both have the drive to grow and reach for the sky.",
        medium: "You share the Wood element's creative and growth-oriented nature. Your paths align beautifully."
      },
      '乙': {
        high: "Both of you possess the graceful Yin Wood energy! Like flexible bamboo, you're adaptable yet resilient artists at heart.",
        medium: "You share the Wood element's artistic sensibility. There's a natural creative connection."
      },
      '丙': {
        high: "Twins of the blazing sun! You both radiate Yang Fire's charisma and passion that lights up any room.",
        medium: "Fire energy flows through both of you. Your warmth and enthusiasm are contagious."
      },
      '丁': {
        high: "You share the gentle Yin Fire energy! Like a candle flame, you both illuminate with subtle yet profound brilliance.",
        medium: "The Fire element connects you both with intelligence and quiet passion."
      },
      '戊': {
        high: "Mountain twins! You both embody Yang Earth's reliability and unwavering strength.",
        medium: "Earth energy grounds you both. Stability and trustworthiness define your characters."
      },
      '己': {
        high: "Fertile soil twins! You share Yin Earth's nurturing nature and practical wisdom.",
        medium: "Earth element connects you with groundedness and care for others."
      },
      '庚': {
        high: "Steel twins! Yang Metal energy gives you both decisive action and strong principles.",
        medium: "Metal element connects you with determination and a sense of justice."
      },
      '辛': {
        high: "Precious gem twins! Yin Metal's refinement and sensitivity shine through you both.",
        medium: "Metal element gives you both elegance and attention to detail."
      },
      '壬': {
        high: "Ocean twins! Yang Water's wisdom and adaptability flow through you both.",
        medium: "Water element connects you with deep intuition and flexibility."
      },
      '癸': {
        high: "Rain twins! Yin Water's creativity and spiritual depth unite you both.",
        medium: "Water element blesses you both with imagination and emotional intelligence."
      }
    };

    const stemMessages = messages[dayMasterHanja] || messages['甲'];
    return score >= 70 ? stemMessages.high : stemMessages.medium;
  },

  // 공유 텍스트 생성
  generateShareText(celebrity, score, grade) {
    const text = {
      ko: `🔮 나와 사주가 같은 K-스타는 ${celebrity.korean}!\n\n⭐ 매칭 점수: ${score}%\n${grade.emoji} ${grade.label}\n\n나도 확인하기 👉`,
      en: `🔮 My K-Star Saju Twin is ${celebrity.name}!\n\n⭐ Match Score: ${score}%\n${grade.emoji} ${grade.labelEn}\n\n#KFortunes #Saju #KStar`
    };
    return text;
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Celebrities;
}
