export interface ArabicLetter {
  id: string
  letter: string
  name: string
  pronunciation: string
  exampleWord: string
  exampleMeaning: string
  forms?: {
    initial?: string
    medial?: string
    terminal?: string
    isolated?: string
  }
}

export const ARABIC_LETTERS: ArabicLetter[] = [
  { id: 'alif', letter: 'ا', name: 'Alif', pronunciation: 'a (long vowel)', exampleWord: 'آمن', exampleMeaning: 'Safe', forms: { initial: 'ا', medial: 'ا', terminal: 'ا', isolated: 'ا' } },
  { id: 'ba', letter: 'ب', name: 'Baa', pronunciation: 'b (book)', exampleWord: 'باب', exampleMeaning: 'Door', forms: { initial: 'بـ', medial: 'ـبـ', terminal: 'ـب', isolated: 'ب' } },
  { id: 'ta', letter: 'ت', name: 'Taa', pronunciation: 't (two)', exampleWord: 'تمر', exampleMeaning: 'Date', forms: { initial: 'تـ', medial: 'ـتـ', terminal: 'ـت', isolated: 'ت' } },
  { id: 'tha', letter: 'ث', name: 'Thaa', pronunciation: 'th (three)', exampleWord: 'ثمار', exampleMeaning: 'Fruits', forms: { initial: 'ثـ', medial: 'ـثـ', terminal: 'ـث', isolated: 'ث' } },
  { id: 'jeem', letter: 'ج', name: 'Jeem', pronunciation: 'j (job)', exampleWord: 'جمل', exampleMeaning: 'Camel', forms: { initial: 'جـ', medial: 'ـجـ', terminal: 'ـج', isolated: 'ج' } },
  { id: 'ha', letter: 'ح', name: 'Ḥaa', pronunciation: 'ḥ (throat)', exampleWord: 'حوت', exampleMeaning: 'Whale', forms: { initial: 'حـ', medial: 'ـحـ', terminal: 'ـح', isolated: 'ح' } },
  { id: 'kha', letter: 'خ', name: 'Khaa', pronunciation: 'kh (guttural)', exampleWord: 'خبز', exampleMeaning: 'Bread', forms: { initial: 'خـ', medial: 'ـخـ', terminal: 'ـخ', isolated: 'خ' } },
  { id: 'dal', letter: 'د', name: 'Daal', pronunciation: 'd (dog)', exampleWord: 'دلو', exampleMeaning: 'Bucket', forms: { initial: 'د', medial: 'د', terminal: 'ـد', isolated: 'د' } },
  { id: 'dhal', letter: 'ذ', name: 'Dhaal', pronunciation: 'dh (there)', exampleWord: 'ذئب', exampleMeaning: 'Wolf', forms: { initial: 'ذ', medial: 'ذ', terminal: 'ـذ', isolated: 'ذ' } },
  { id: 'ra', letter: 'ر', name: 'Raa', pronunciation: 'r (run)', exampleWord: 'رمل', exampleMeaning: 'Sand', forms: { initial: 'ر', medial: 'ر', terminal: 'ـر', isolated: 'ر' } },
  { id: 'za', letter: 'ز', name: 'Zaa', pronunciation: 'z (zoo)', exampleWord: 'زر', exampleMeaning: 'Button', forms: { initial: 'ز', medial: 'ز', terminal: 'ـز', isolated: 'ز' } },
  { id: 'seen', letter: 'س', name: 'Seen', pronunciation: 's (seen)', exampleWord: 'سمك', exampleMeaning: 'Fish', forms: { initial: 'سـ', medial: 'ـسـ', terminal: 'ـس', isolated: 'س' } },
  { id: 'sheen', letter: 'ش', name: 'Sheen', pronunciation: 'sh (short)', exampleWord: 'شمس', exampleMeaning: 'Sun', forms: { initial: 'شـ', medial: 'ـشـ', terminal: 'ـش', isolated: 'ش' } },
  { id: 'saad', letter: 'ص', name: 'Saad', pronunciation: 's (emphatic)', exampleWord: 'صبي', exampleMeaning: 'Boy', forms: { initial: 'صـ', medial: 'ـصـ', terminal: 'ـص', isolated: 'ص' } },
  { id: 'daad', letter: 'ض', name: 'Daad', pronunciation: 'd (emphatic)', exampleWord: 'ضرس', exampleMeaning: 'Tooth', forms: { initial: 'ضـ', medial: 'ـضـ', terminal: 'ـض', isolated: 'ض' } },
  { id: 'taa', letter: 'ط', name: 'Taa', pronunciation: 't (emphatic)', exampleWord: 'طائرة', exampleMeaning: 'Airplane', forms: { initial: 'طـ', medial: 'ـطـ', terminal: 'ـط', isolated: 'ط' } },
  { id: 'dhaa', letter: 'ظ', name: 'Dhaa', pronunciation: 'z (emphatic)', exampleWord: 'ظبي', exampleMeaning: 'Antelope', forms: { initial: 'ظـ', medial: 'ـظـ', terminal: 'ـظ', isolated: 'ظ' } },
  { id: 'ain', letter: 'ع', name: 'Ain', pronunciation: 'ʿ (guttural)', exampleWord: 'عمل', exampleMeaning: 'Work', forms: { initial: 'عـ', medial: 'ـعـ', terminal: 'ـع', isolated: 'ع' } },
  { id: 'ghain', letter: 'غ', name: 'Ghain', pronunciation: 'gh (guttural)', exampleWord: 'غابة', exampleMeaning: 'Forest', forms: { initial: 'غـ', medial: 'ـغـ', terminal: 'ـغ', isolated: 'غ' } },
  { id: 'fa', letter: 'ف', name: 'Faa', pronunciation: 'f (far)', exampleWord: 'فهد', exampleMeaning: 'Leopard', forms: { initial: 'فـ', medial: 'ـفـ', terminal: 'ـف', isolated: 'ف' } },
  { id: 'qaf', letter: 'ق', name: 'Qaf', pronunciation: 'q (guttural)', exampleWord: 'قمر', exampleMeaning: 'Moon', forms: { initial: 'قـ', medial: 'ـقـ', terminal: 'ـق', isolated: 'ق' } },
  { id: 'kaf', letter: 'ك', name: 'Kaaf', pronunciation: 'k (king)', exampleWord: 'كلب', exampleMeaning: 'Dog', forms: { initial: 'كـ', medial: 'ـكـ', terminal: 'ـك', isolated: 'ك' } },
  { id: 'lam', letter: 'ل', name: 'Laam', pronunciation: 'l (lamp)', exampleWord: 'لبن', exampleMeaning: 'Milk', forms: { initial: 'لـ', medial: 'ـلـ', terminal: 'ـل', isolated: 'ل' } },
  { id: 'meem', letter: 'م', name: 'Meem', pronunciation: 'm (mom)', exampleWord: 'ماء', exampleMeaning: 'Water', forms: { initial: 'مـ', medial: 'ـمـ', terminal: 'ـم', isolated: 'م' } },
  { id: 'noon', letter: 'ن', name: 'Noon', pronunciation: 'n (no)', exampleWord: 'نمر', exampleMeaning: 'Tiger', forms: { initial: 'نـ', medial: 'ـنـ', terminal: 'ـن', isolated: 'ن' } },
  { id: 'waw', letter: 'و', name: 'Waw', pronunciation: 'w (work)', exampleWord: 'وردة', exampleMeaning: 'Rose', forms: { initial: 'و', medial: 'و', terminal: 'ـو', isolated: 'و' } },
  { id: 'ha-final', letter: 'ه', name: 'Haa', pronunciation: 'h (hall)', exampleWord: 'هرم', exampleMeaning: 'Pyramid', forms: { initial: 'هـ', medial: 'ـهـ', terminal: 'ـه', isolated: 'ه' } },
  { id: 'ya', letter: 'ي', name: 'Yaa', pronunciation: 'y (yes)', exampleWord: 'يد', exampleMeaning: 'Hand', forms: { initial: 'يـ', medial: 'ـيـ', terminal: 'ـي', isolated: 'ي' } },
]
