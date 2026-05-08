import EngineeringImage from "../images/Engineering.png";
import ArchitectureImage from "../images/Architecture.png";
import MedicalImage from "../images/Medical.png";
import UniversityImage from "../images/University.png";
import ArtsImage from "../images/arts&science.png";
import DegreeImage from "../images/Degree.png";

export type CollegeCategory =
  | "architecture"
  | "engineering"
  | "medical"
  | "university"
  | "arts"
  | "degree"
  | "default";

export const COLLEGE_IMAGES: Record<CollegeCategory, string> = {
  architecture: ArchitectureImage,
  engineering: EngineeringImage,
  medical: MedicalImage,
  university: UniversityImage,
  arts: ArtsImage,
  degree: DegreeImage,
  default: DegreeImage,
};

export const getCollegeImageUrl = (collegeName: string): string => {
  const lowerName = collegeName.toLowerCase();

  if (lowerName.includes("architecture"))
    return COLLEGE_IMAGES.architecture;

  if (
    lowerName.includes("engineering") ||
    lowerName.includes("technology") ||
    lowerName.includes("tech")
  )
    return COLLEGE_IMAGES.engineering;

  if (lowerName.includes("medical"))
    return COLLEGE_IMAGES.medical;

  if (lowerName.includes("arts"))
    return COLLEGE_IMAGES.arts;

  if (lowerName.includes("university"))
    return COLLEGE_IMAGES.university;

  return COLLEGE_IMAGES.default;
};