export interface ArabicLetter {
  id: string
  letter: string
  name: string
  pronunciation: string
  exampleWord: string
  exampleMeaning: string
}

export const ARABIC_LETTERS: ArabicLetter[] = [
  { id: 'ba', letter: 'ب', name: 'Baa', pronunciation: 'b (book)', exampleWord: 'باب', exampleMeaning: 'Door' },
  { id: 'ta', letter: 'ت', name: 'Taa', pronunciation: 't (two)', exampleWord: 'تمر', exampleMeaning: 'Date' },
  { id: 'tha', letter: 'ث', name: 'Thaa', pronunciation: 'th (three)', exampleWord: 'ثمار', exampleMeaning: 'Fruits' },
  { id: 'jeem', letter: 'ج', name: 'Jeem', pronunciation: 'j (job)', exampleWord: 'جمل', exampleMeaning: 'Camel' },
  { id: 'ha', letter: 'ح', name: 'Ḥaa', pronunciation: 'ḥ (throat)', exampleWord: 'حوت', exampleMeaning: 'Whale' },
  { id: 'kha', letter: 'خ', name: 'Khaa', pronunciation: 'kh (guttural)', exampleWord: 'خبز', exampleMeaning: 'Bread' },
  { id: 'dal', letter: 'د', name: 'Daal', pronunciation: 'd (dog)', exampleWord: 'دلو', exampleMeaning: 'Bucket' },
  { id: 'dhal', letter: 'ذ', name: 'Dhaal', pronunciation: 'dh (there)', exampleWord: 'ذئب', exampleMeaning: 'Wolf' },
  { id: 'ra', letter: 'ر', name: 'Raa', pronunciation: 'r (run)', exampleWord: 'رمل', exampleMeaning: 'Sand' },
  { id: 'za', letter: 'ز', name: 'Zaa', pronunciation: 'z (zoo)', exampleWord: 'زر', exampleMeaning: 'Button' },
  { id: 'seen', letter: 'س', name: 'Seen', pronunciation: 's (seen)', exampleWord: 'سمك', exampleMeaning: 'Fish' },
  { id: 'sheen', letter: 'ش', name: 'Sheen', pronunciation: 'sh (short)', exampleWord: 'شمس', exampleMeaning: 'Sun' },
  { id: 'saad', letter: 'ص', name: 'Saad', pronunciation: 's (emphatic)', exampleWord: 'صبي', exampleMeaning: 'Boy' },
  { id: 'daad', letter: 'ض', name: 'Daad', pronunciation: 'd (emphatic)', exampleWord: 'ضرس', exampleMeaning: 'Tooth' },
  { id: 'taa', letter: 'ط', name: 'Taa', pronunciation: 't (emphatic)', exampleWord: 'طائرة', exampleMeaning: 'Airplane' },
  { id: 'dhaa', letter: 'ظ', name: 'Dhaa', pronunciation: 'z (emphatic)', exampleWord: 'ظبي', exampleMeaning: 'Antelope' },
  { id: 'ain', letter: 'ع', name: 'Ain', pronunciation: 'ʿ (guttural)', exampleWord: 'عمل', exampleMeaning: 'Work' },
  { id: 'ghain', letter: 'غ', name: 'Ghain', pronunciation: 'gh (guttural)', exampleWord: 'غابة', exampleMeaning: 'Forest' },
  { id: 'fa', letter: 'ف', name: 'Faa', pronunciation: 'f (far)', exampleWord: 'فهد', exampleMeaning: 'Leopard' },
  { id: 'qaf', letter: 'ق', name: 'Qaf', pronunciation: 'q (guttural)', exampleWord: 'قمر', exampleMeaning: 'Moon' },
  { id: 'kaf', letter: 'ك', name: 'Kaaf', pronunciation: 'k (king)', exampleWord: 'كلب', exampleMeaning: 'Dog' },
  { id: 'lam', letter: 'ل', name: 'Laam', pronunciation: 'l (lamp)', exampleWord: 'لبن', exampleMeaning: 'Milk' },
  { id: 'meem', letter: 'م', name: 'Meem', pronunciation: 'm (mom)', exampleWord: 'ماء', exampleMeaning: 'Water' },
  { id: 'noon', letter: 'ن', name: 'Noon', pronunciation: 'n (no)', exampleWord: 'نمر', exampleMeaning: 'Tiger' },
  { id: 'waw', letter: 'و', name: 'Waw', pronunciation: 'w (work)', exampleWord: 'وردة', exampleMeaning: 'Rose' },
  { id: 'ha-final', letter: 'ه', name: 'Haa', pronunciation: 'h (hall)', exampleWord: 'هرم', exampleMeaning: 'Pyramid' },
  { id: 'ya', letter: 'ي', name: 'Yaa', pronunciation: 'y (yes)', exampleWord: 'يد', exampleMeaning: 'Hand' },
  { id: 'alif', letter: 'ا', name: 'Alif', pronunciation: 'a (long vowel)', exampleWord: 'آمن', exampleMeaning: 'Safe' },
]
