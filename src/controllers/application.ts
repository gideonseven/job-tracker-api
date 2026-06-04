import type { Request, Response } from "express";
import type { Application } from "../types/application.js";


const applications: Application[] = [
  {
    id: 1,
    company: "BetterLabs",
    role: "Software Engineer",
    status: "Applied",
    appliedDate: "2026-05-15",
    notes: "Perth-based, Town Square product",
  },
  {
    id: 2,
    company: "Canva",
    role: "Android Engineer",
    status: "Applied",
    appliedDate: "2026-05-18",
    notes: "Sydney office",
  },
]; // In-memory storage for job applications

export function listApplications(_req: Request, res: Response): void {
    res.json(applications);
}

// get application by id
export function getApplication(req: Request, res: Response): void {
    const id = parseInt(req.params.id);
    const application = applications.find((app) => app.id === id);

    if( !application){
        res.status(404).json({error: "Application not found"});
        return;
    }

    res.json(application);
}

// create new application ( post request)
export function createApplication(req: Request, res: Response): void {

  const { company, role, status, appliedDate, notes } = req.body;

  const newApplication: Application = {
    id: applications.length + 1,
    company,
    role,
    status,
    appliedDate,
    notes,
  };

  applications.push(newApplication);
  res.status(201).json(newApplication);

}




// PUT update an existing application by id
export function updateApplication(req: Request, res: Response): void {
  const id = parseInt(req.params.id);
  const index = applications.findIndex((app) => app.id === id);

  if(index === -1){
    res.status(404).json({error: "Application not found"});
    return;
  }

  // Update the application with new data, keeping the id unchanged
  // {...existing, ...incoming} creates a new object that combines 
  applications[index] = { ...applications[index]!, ...req.body, id}; 
  res.json(applications[index]);

}

//remove an application by id
export function deleteApplication(req: Request, res: Response): void {
  const id = parseInt(req.params.id);
  const index = applications.findIndex((app) => app.id === id);

  if(index === -1){
    res.status(404).json({error: "Application not found"});
    return;
  }

  applications.splice(index, 1); // remove the application from the array
  res.status(204).send(); // send no content status

}