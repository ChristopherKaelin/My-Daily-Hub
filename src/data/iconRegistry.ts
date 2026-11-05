import type { Icon } from '@phosphor-icons/react'
import {
  // fitness
  Barbell,
  Bicycle,
  Footprints,
  SneakerMove,
  Golf,
  PersonSimpleTaiChi,
  // health
  Pill,
  Bandaids,
  Stethoscope,
  Prescription,
  Asclepius,
  Heartbeat,
  Brain,
  // sleep
  MoonStars,
  Bed,
  BatteryCharging,
  // food
  Coffee,
  CookingPot,
  Grains,
  Drop,
  PintGlass,
  // faith
  Cross,
  HandsPraying,
  // learning
  Books,
  BookOpenText,
  Notebook,
  Student,
  ChalkboardTeacher,
  GraduationCap,
  // home
  Broom,
  WashingMachine,
  PottedPlant,
  Leaf,
  HouseLine,
  Toolbox,
  Shovel,
  JarLabel,
  // finance
  Bank,
  CurrencyCircleDollar,
  CurrencyDollar,
  MoneyWavy,
  // people
  UsersThree,
  UsersFour,
  Handshake,
  HandHeart,
  AddressBookTabs,
  // social_logos
  LinkedinLogo,
  XLogo,
  YoutubeLogo,
  FacebookLogo,
  InstagramLogo,
  GoogleLogo,
  MetaLogo,
  OpenAiLogo,
  NyTimesLogo,
  StripeLogo,
  ApplePodcastsLogo,
  SpotifyLogo,
  // work_dev
  Code,
  CodeBlock,
  CodesandboxLogo,
  FileHtml,
  FileCode,
  FileSql,
  Upload,
  FolderOpen,
  // work_admin
  Calculator,
  CalendarBlank,
  CalendarCheck,
  Clock,
  ClockUser,
  NotePencil,
  PencilLine,
  PresentationChart,
  ListChecks,
  Target,
  Trash,
  EnvelopeOpen,
  EnvelopeSimpleOpen,
  Globe,
  TreeStructure,
  Star,
  Headset,
} from '@phosphor-icons/react'

/**
 * Icon registry: maps each icon_options.key (from the database) to its
 * Phosphor React component. Explicit named imports, not a dynamic
 * namespace import, so unused icons are tree-shaken out of the bundle.
 *
 * Keep this in sync with the icon_options seed data in
 * supabase/migrations/20261105113500_add_icon_options.sql.
 */
export const ICON_REGISTRY: Record<string, Icon> = {
  // fitness
  barbell: Barbell,
  bicycle: Bicycle,
  footprints: Footprints,
  'sneaker-move': SneakerMove,
  golf: Golf,
  'person-simple-tai-chi': PersonSimpleTaiChi,

  // health
  pill: Pill,
  bandaids: Bandaids,
  stethoscope: Stethoscope,
  prescription: Prescription,
  asclepius: Asclepius,
  heartbeat: Heartbeat,
  brain: Brain,

  // sleep
  'moon-stars': MoonStars,
  bed: Bed,
  'battery-charging': BatteryCharging,

  // food
  coffee: Coffee,
  'cooking-pot': CookingPot,
  grains: Grains,
  drop: Drop,
  'pint-glass': PintGlass,

  // faith
  cross: Cross,
  'hands-praying': HandsPraying,

  // learning
  books: Books,
  'book-open-text': BookOpenText,
  notebook: Notebook,
  student: Student,
  'chalkboard-teacher': ChalkboardTeacher,
  'graduation-cap': GraduationCap,

  // home
  broom: Broom,
  'washing-machine': WashingMachine,
  'potted-plant': PottedPlant,
  leaf: Leaf,
  'house-line': HouseLine,
  toolbox: Toolbox,
  shovel: Shovel,
  'jar-label': JarLabel,

  // finance
  bank: Bank,
  'currency-circle-dollar': CurrencyCircleDollar,
  'currency-dollar': CurrencyDollar,
  'money-wavy': MoneyWavy,

  // people
  'users-three': UsersThree,
  'users-four': UsersFour,
  handshake: Handshake,
  'hand-heart': HandHeart,
  'address-book-tabs': AddressBookTabs,

  // social_logos
  'linkedin-logo': LinkedinLogo,
  'x-logo': XLogo,
  'youtube-logo': YoutubeLogo,
  'facebook-logo': FacebookLogo,
  'instagram-logo': InstagramLogo,
  'google-logo': GoogleLogo,
  'meta-logo': MetaLogo,
  'open-ai-logo': OpenAiLogo,
  'ny-times-logo': NyTimesLogo,
  'stripe-logo': StripeLogo,
  'apple-podcasts-logo': ApplePodcastsLogo,
  'spotify-logo': SpotifyLogo,

  // work_dev
  code: Code,
  'code-block': CodeBlock,
  'codesandbox-logo': CodesandboxLogo,
  'file-html': FileHtml,
  'file-code': FileCode,
  'file-sql': FileSql,
  upload: Upload,
  'folder-open': FolderOpen,

  // work_admin
  calculator: Calculator,
  'calendar-blank': CalendarBlank,
  'calendar-check': CalendarCheck,
  clock: Clock,
  'clock-user': ClockUser,
  'note-pencil': NotePencil,
  'pencil-line': PencilLine,
  'presentation-chart': PresentationChart,
  'list-checks': ListChecks,
  target: Target,
  trash: Trash,
  'envelope-open': EnvelopeOpen,
  'envelope-simple-open': EnvelopeSimpleOpen,
  globe: Globe,
  'tree-structure': TreeStructure,
  star: Star,
  headset: Headset,
}

export interface IconOption {
  key: string
  label: string
  category: string
}

/**
 * Static copy of the icon_options seed data for client-side search/filter
 * in the picker, so the combobox doesn't need a network round trip to
 * list or search icons. Must stay in sync with the migration's seed data
 * (key, label, category, and insertion order/grouping).
 */
export const ICON_OPTIONS: IconOption[] = [
  { key: 'barbell', label: 'Barbell', category: 'fitness' },
  { key: 'bicycle', label: 'Bicycle', category: 'fitness' },
  { key: 'footprints', label: 'Footprints', category: 'fitness' },
  { key: 'sneaker-move', label: 'Sneaker move', category: 'fitness' },
  { key: 'golf', label: 'Golf', category: 'fitness' },
  { key: 'person-simple-tai-chi', label: 'Tai chi', category: 'fitness' },

  { key: 'pill', label: 'Pill', category: 'health' },
  { key: 'bandaids', label: 'Bandaids', category: 'health' },
  { key: 'stethoscope', label: 'Stethoscope', category: 'health' },
  { key: 'prescription', label: 'Prescription', category: 'health' },
  { key: 'asclepius', label: 'Asclepius', category: 'health' },
  { key: 'heartbeat', label: 'Heartbeat', category: 'health' },
  { key: 'brain', label: 'Brain', category: 'health' },

  { key: 'moon-stars', label: 'Moon stars', category: 'sleep' },
  { key: 'bed', label: 'Bed', category: 'sleep' },
  { key: 'battery-charging', label: 'Battery charging', category: 'sleep' },

  { key: 'coffee', label: 'Coffee', category: 'food' },
  { key: 'cooking-pot', label: 'Cooking pot', category: 'food' },
  { key: 'grains', label: 'Grains', category: 'food' },
  { key: 'drop', label: 'Drop', category: 'food' },
  { key: 'pint-glass', label: 'Pint glass', category: 'food' },

  { key: 'cross', label: 'Cross', category: 'faith' },
  { key: 'hands-praying', label: 'Hands praying', category: 'faith' },

  { key: 'books', label: 'Books', category: 'learning' },
  { key: 'book-open-text', label: 'Book open text', category: 'learning' },
  { key: 'notebook', label: 'Notebook', category: 'learning' },
  { key: 'student', label: 'Student', category: 'learning' },
  { key: 'chalkboard-teacher', label: 'Chalkboard teacher', category: 'learning' },
  { key: 'graduation-cap', label: 'Graduation cap', category: 'learning' },

  { key: 'broom', label: 'Broom', category: 'home' },
  { key: 'washing-machine', label: 'Washing machine', category: 'home' },
  { key: 'potted-plant', label: 'Potted plant', category: 'home' },
  { key: 'leaf', label: 'Leaf', category: 'home' },
  { key: 'house-line', label: 'House', category: 'home' },
  { key: 'toolbox', label: 'Toolbox', category: 'home' },
  { key: 'shovel', label: 'Shovel', category: 'home' },
  { key: 'jar-label', label: 'Jar label', category: 'home' },

  { key: 'bank', label: 'Bank', category: 'finance' },
  { key: 'currency-circle-dollar', label: 'Currency circle dollar', category: 'finance' },
  { key: 'currency-dollar', label: 'Currency dollar', category: 'finance' },
  { key: 'money-wavy', label: 'Money wavy', category: 'finance' },

  { key: 'users-three', label: 'Users three', category: 'people' },
  { key: 'users-four', label: 'Users four', category: 'people' },
  { key: 'handshake', label: 'Handshake', category: 'people' },
  { key: 'hand-heart', label: 'Hand heart', category: 'people' },
  { key: 'address-book-tabs', label: 'Address book tabs', category: 'people' },

  { key: 'linkedin-logo', label: 'LinkedIn', category: 'social_logos' },
  { key: 'x-logo', label: 'X', category: 'social_logos' },
  { key: 'youtube-logo', label: 'YouTube', category: 'social_logos' },
  { key: 'facebook-logo', label: 'Facebook', category: 'social_logos' },
  { key: 'instagram-logo', label: 'Instagram', category: 'social_logos' },
  { key: 'google-logo', label: 'Google', category: 'social_logos' },
  { key: 'meta-logo', label: 'Meta', category: 'social_logos' },
  { key: 'open-ai-logo', label: 'OpenAI', category: 'social_logos' },
  { key: 'ny-times-logo', label: 'NY Times', category: 'social_logos' },
  { key: 'stripe-logo', label: 'Stripe', category: 'social_logos' },
  { key: 'apple-podcasts-logo', label: 'Apple Podcasts', category: 'social_logos' },
  { key: 'spotify-logo', label: 'Spotify', category: 'social_logos' },

  { key: 'code', label: 'Code', category: 'work_dev' },
  { key: 'code-block', label: 'Code block', category: 'work_dev' },
  { key: 'codesandbox-logo', label: 'CodeSandbox', category: 'work_dev' },
  { key: 'file-html', label: 'HTML file', category: 'work_dev' },
  { key: 'file-code', label: 'Code file', category: 'work_dev' },
  { key: 'file-sql', label: 'SQL file', category: 'work_dev' },
  { key: 'upload', label: 'Upload', category: 'work_dev' },
  { key: 'folder-open', label: 'Folder open', category: 'work_dev' },

  { key: 'calculator', label: 'Calculator', category: 'work_admin' },
  { key: 'calendar-blank', label: 'Calendar', category: 'work_admin' },
  { key: 'calendar-check', label: 'Calendar check', category: 'work_admin' },
  { key: 'clock', label: 'Clock', category: 'work_admin' },
  { key: 'clock-user', label: 'Clock user', category: 'work_admin' },
  { key: 'note-pencil', label: 'Note pencil', category: 'work_admin' },
  { key: 'pencil-line', label: 'Pencil line', category: 'work_admin' },
  { key: 'presentation-chart', label: 'Presentation chart', category: 'work_admin' },
  { key: 'list-checks', label: 'List checks', category: 'work_admin' },
  { key: 'target', label: 'Target', category: 'work_admin' },
  { key: 'trash', label: 'Trash', category: 'work_admin' },
  { key: 'envelope-open', label: 'Envelope open', category: 'work_admin' },
  { key: 'envelope-simple-open', label: 'Envelope simple open', category: 'work_admin' },
  { key: 'globe', label: 'Globe', category: 'work_admin' },
  { key: 'tree-structure', label: 'Tree structure', category: 'work_admin' },
  { key: 'star', label: 'Star', category: 'work_admin' },
  { key: 'headset', label: 'Headset', category: 'work_admin' },
]
