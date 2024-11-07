export type ErrorCodeKeys =
  | 'EG-101'
  | 'EG-102'
  | 'EG-103'
  | 'EG-110'
  | 'EG-201'
  | 'EG-202'
  | 'EG-203'
  | 'EG-204'
  | 'EG-211'
  | 'EG-212'
  | 'EG-213'
  | 'EG-214'
  | 'EG-215'
  | 'EG-301'
  | 'EG-302'
  | 'EG-303'
  | 'EG-304'
  | 'EG-305'
  | 'EG-306'
  | 'EG-307'
  | 'EG-311'
  | 'EG-312'
  | 'EG-313'
  | 'EG-314'
  | 'EG-401'
  | 'EG-402'
  | 'EG-403'
  | 'EG-404'
  | 'EG-405';

export type ErrorMessages = {
  [key in ErrorCodeKeys]: string;
};