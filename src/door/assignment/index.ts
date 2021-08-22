import { Activity, ActivityHead } from './activity.interfaces';
import { Homework, HomeworkHead } from './homework.interfaces';
import { TeamProject, TeamProjectHead } from './team_project.interfaces';

export type Assignment = Homework | TeamProject | Activity;
export type AssignmentHead = HomeworkHead | TeamProjectHead | ActivityHead;
