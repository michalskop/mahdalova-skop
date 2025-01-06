// data/testimonials.ts

export interface TestimonialData {
  id: string;
  text: string;
  author: string;
  position: string;
  date: string;
}

export const testimonials: TestimonialData[] = [
   {
    id: '18',
    text: 'Thank you for the work you do, really good!',
    author: 'Ivan Gabal',
    position: 'sociologist, co-founder of OF',
    date: '12/19/2024'
  },
    {
    id: '17',
    text: 'Thanks to Kateřina Mahdalová for great visualizations (I recommend following her), that’s why I wrote some time ago that with this unexpected move, Seznam Zprávy lost one of the best Czech data journalists.',
    author: 'Tomáš Protivínský',
    position: 'IDEA CERGE-EI',
    date: '11/6/2024'
  },
  {
    id: '16',
    text: 'Thank you for your great work, I stand by you and I am not alone.',
    author: 'Lucie Fremrová',
    position: 'University of Brighton',
    date: '11/6/2024'
  }, 
   {
    id: '15',
    text: 'A year ago, Kateřina Mahdalová exposed the manipulated survey by the Prague Chamber of Commerce on traffic calming in the center. While other media just blindly repeated it without verification. Respect for that!',
    author: 'Cities for People',
    position: 'organization',
    date: '10/6/2024'
  },
    {
    id: '14',
    text: 'In my opinion, Mahdalová and Škop are the best data journalists here.',
    author: 'Michal Illich',
    position: 'entrepreneur, investor',
    date: '10/3/2024'
  },
      {
    id: '13',
    text: '[...] the award goes to the duo Kateřina Mahdalová and Michal Škop for their thorough preparation of the election calculator, our most prominent pre-election contribution last week before the European elections.',
    author: 'Jiří Kubík',
    position: 'editor-in-chief SZ',
    date: '6/3/2024'
  },
    {
    id: '12',
    text: 'I would like to highlight the work of our Kateřina Mahdalová and Michal Škop - their model again showed results very accurately just an hour and a half after the polls closed (Slovak elections 2023).',
    author: 'Tomáš Kapler',
    position: 'AI and online business consultant',
    date: '10/1/2023'
  },
     {
    id: '11',
    text: 'A huge amount of work is visible behind the quality of life map for individual municipalities (this time with a clear rating using the number of "stars") prepared by Kateřina Mahdalová and Michal Škop.',
    author: 'Jiří Kubík',
    position: 'editor-in-chief SZ',
    date: '4/11/2023'
  },
      {
    id: '10',
    text: 'I have always enjoyed reading your articles; it has always been good work.',
    author: 'Dušan Janovský',
    position: 'Seznam.cz search consultant',
    date: '4/11/2023'
  },
        {
    id: '9',
    text: 'Hats off! You are good 🙂',
    author: 'Václav Štětka',
    position: 'media expert, Uni Loughborough',
    date: '1/28/2023'
  },
      {
    id: '8',
    text: 'Congratulations to Kateřina and Michal 👍👏👏👏 Their prediction was absolutely accurate. Thanks to them, Seznam Zprávy could report an hour earlier than the results from ČSÚ that Petr Pavel would surpass Andrej Babiš.',
    author: 'Jiří Kubík',
    position: 'editor-in-chief SZ',
    date: '1/14/2023'
  },
      {
    id: '7',
    text: '[...] systematic work by Katka Mahdalová and Michal Škop on parliamentary attendance and presidential chances.',
    author: 'Martin Jašminský',
    position: 'editor-in-chief SZ business',
    date: '12/19/2022'
  },
      {
    id: '6',
    text: '[...] things stood out last week unequivocally from the gray numerical average: the Presidential Compass by Kateřina Mahdalová and Michal Škop, our new tool for presidential preferences.',
    author: 'Jiří Kubík',
    position: 'editor-in-chief SZ',
    date: '11/21/2022'
  },
      {
    id: '5',
    text: 'I also consider the special calculator to be truly exceptional content. K. Mahdalová and M. Škop presented a great election calculator focused on municipal elections, specifically election programs in big cities.',
    author: 'Jiří Kubík',
    position: 'editor-in-chief SZ',
    date: '9/19/2022'
  },
      {
    id: '4',
    text: 'Kateřina Mahdalová excellently processed a series on the state of vaccination in the Czech Republic.',
    author: 'Jakub Unger',
    position: 'editorial director SZ',
    date: '5/24/2021'
  },
    {
    id: '3',
    text: 'You’re doing it [Kateřina] well, catching interesting perspectives. I think it fits perfectly.',
    author: 'Jaroslav Kábele',
    position: 'general director ČTK',
    date: '4/8/2021'
  },
    {
    id: '2',
    text: 'An excellent analysis by Kateřina Mahdalová based on data from the Ministry of Health about how individual measures limit the spread of the infection (closed districts, which prolonged the state of emergency, are not among them).',
    author: 'Jiří Kubík',
    position: 'editor-in-chief SZ',
    date: '3/29/2021'
  },
  {
    id: '1',
    text: 'Exceptionally well-done things that definitely deserve praise: A unique election model, constantly updated with new preference surveys, created by Kateřina Mahdalová.',
    author: 'Jiří Kubík',
    position: 'editor-in-chief SZ',
    date: '3/21/2021'
  }
]
