using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class map : MonoBehaviour {

    private List<Point> openList = new List<Point>();
    private List<Point> closeList = new List<Point>();
    private static int width = 8;
    private static int height = 6;
    private Point[,] mapArr = new Point[width,height];
    private int[,] wallArr = {{4,2},{4,3},{4,4},{3,2},{3,4},{4,0}};
	// Use this for initialization
	void Start () {
		createMap();
        createBarrier();
        Point start = mapArr[2,3];
        Point end = mapArr[6,3];
        pathFind(start,end);
        //输出
        Point temp = end;
        while(temp.parent != null)
        {
            Debug.Log(temp.parent.X + "-" + temp.parent.Y);
            temp = temp.parent;
        }
        Debug.Log(openList.Count);
	}
    //地图
	void createMap()
    {
        for(int x = 0;x < width;x++)
        {
            for (int y = 0; y < height; y++)
            {
                mapArr[x,y] = new Point(x,y);
            }
        }
        // mapArr[4,2].isWall = true;
        // mapArr[4,3].isWall = true;
        // mapArr[4,4].isWall = true;
        // mapArr[4,5].isWall = true;
    }
    void createBarrier()
    {
        for(int i = 0;i < 5;i++)
        {
            int a = 0;
            int b = 0;
            for(int j = 0;j < 2;j++)
            {
                if(j == 0)
                a = wallArr[i,j];
                else
                b = wallArr[i,j];
            }
            mapArr[a,b].isWall = true;
        }
    }
    //寻路算法，思路是找开启列表中f值最小的点作为当前点的子节点
    void pathFind(Point start,Point end)
    {
        openList.Add(start);
        //这里的条件需要改进
        while(openList.Count > 0)
        {
            //选好的点
            Point point = findMinF(openList);
            openList.Remove(point);
            closeList.Add(point);
            List<Point> points = surroundPoint(point);
            pointFilter(points);
            foreach(Point i in points)
            {
                if(openList.IndexOf(i) != -1)
                {
                    float nowG = calcG(i,point);
                    if(point.G > nowG)
                    {
                        //更改父节点
                        i.setParent(point,nowG);
                    } 
                }
                //未知领域
                else{
                    i.parent = point;
                    calcF(i,end);
                    openList.Add(i);
                }
                
            }
            if(openList.IndexOf(end) != -1)
            {
                break;
            }
        }
    }
    //寻找某个点周围可达的点（八方向）
    private List<Point> surroundPoint(Point now)
    {
        Point left = null; 
        Point right = null; 
        Point up = null; 
        Point down = null; 
        Point lu = null; 
        Point ru = null; 
        Point ld = null; 
        Point rd = null; 
        List<Point> list = new List<Point>();
        if(now.X > 0)
        left = mapArr[now.X+1,now.Y];
        if(now.X < width-1)
        right = mapArr[now.X-1,now.Y];
        if(now.Y > 0)
        down = mapArr[now.X,now.Y-1];
        if(now.Y < height-1)
        up = mapArr[now.X,now.Y+1];
        if(left != null && up != null &&(!left.isWall || !up.isWall))
        lu = mapArr[now.X-1,now.Y+1];
        if(right != null && up != null &&(!right.isWall || !up.isWall))
        ru = mapArr[now.X+1,now.Y+1];
        if(left != null && down != null &&(!left.isWall || !down.isWall))
        ld = mapArr[now.X-1,now.Y-1];
        if(right != null && down != null &&(!right.isWall || !down.isWall))
        rd = mapArr[now.X+1,now.Y-1];
        if(left != null && !left.isWall)
        list.Add(left);
        if(right != null && !right.isWall)
        list.Add(right);
        if(up != null && !up.isWall)
        list.Add(up);
        if(down != null && !down.isWall)
        list.Add(down);
        if(lu != null && !lu.isWall)
        list.Add(lu);
        if(ru != null && !ru.isWall)
        list.Add(ru);
        if(ld != null && !ld.isWall)
        list.Add(ld);
        if(rd != null && !rd.isWall)
        list.Add(rd);
        return list;
    }
    //删除源列表中在关闭列表中存在的点
    void pointFilter(List<Point> src)
    {
        foreach(Point i in closeList)
        {
            if(src.IndexOf(i)!= -1)
            {
                src.Remove(i);
            }
        }
    }
    private Point findMinF(List<Point> openList)
    {
        float f = float.MaxValue;
        Point p = null;
        foreach(Point i in openList)
        {
            if(i.F < f)
            {
                f = i.F;
                p = i;
            }
        }
        return p;
    }
    //单独求出现在的点到另外一点的G值,用于获得更小的G值
    private float calcG(Point now,Point other)
    {
        float g = Vector2.Distance(new Vector2(other.X,other.Y),new Vector2(now.X,now.Y)) + other.G;
        return g;
    }
    void calcF(Point now,Point end)
    {
        //待修改
        // now.H = Mathf.Abs(now.Y-end.Y) + Mathf.Abs(now.X-end.X);
        now.H = Vector2.Distance(new Vector2(now.X,now.Y),new Vector2(end.X,end.Y));
        if(now.parent != null)
        now.G = Vector2.Distance(new Vector2(now.parent.X,now.parent.Y),new Vector2(now.X,now.Y)) + now.parent.G;
        else 
        now.G = 0;
        now.F = now.H + now.G; 
    }
}